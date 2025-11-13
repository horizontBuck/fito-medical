import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { pb } from '../core/pocketbase.client';
export interface Professional {
  id: string;
  name: string;
  email: string;
  avatarFile?: string;
  profession?: string;
  businessName?: string;
  providerStatus?: string;
  rating?: number;
  price?: number;
  modalidadAtencion?: any[];
  zonaAtencion?: any[];
  especialidades?: any[];
  phone?: string;
  Biography?: string;
  category?: string;
  subcategory?: string;
  gender?: string;
  isOnline?: boolean;
  lat?: number;
  lng?: number;
}

@Injectable({ providedIn: 'root' })
export class ProfessionalsService {
  /** 🔹 Colección (usa 'approved_providers' si creaste la vista pública) */
  private collection = 'users';

  private _professionals$ = new BehaviorSubject<Professional[]>([]);
  public professionals$ = this._professionals$.asObservable();

  constructor() {
    console.log('🩺 ProfessionalsService inicializado');
    this.loadProfessionals();
    this.subscribeRealtime();
    this.listenAppointmentsRealtime();

    pb.authStore.onChange(() => {
      console.log(' Cambio de sesión → autenticado:', pb.authStore.isValid);
    });
  }
getCurrentUserId(): string | undefined {
  return pb.authStore.model?.id;
}



  async loadProfessionals(): Promise<void> {
  console.log('🔍 Cargando profesionales aprobados...');

  try {
    const records = await pb.collection(this.collection).getFullList<Professional>({
      filter: '(role = "proveedor" || role = "experto") && (providerStatus = "approved" || providerStatus = "aprobado")',
      sort: '-created',
      // ✅ AÑADIDOS lat,lng,isOnline
      fields: 'id,name,email,avatarFile,profession,businessName,providerStatus,phone,especialidades,modalidadAtencion,zonaAtencion,lat,lng,isOnline',
    });


    const processed = records.map((u: any) => ({
      id: u.id,
      name: u.name || 'Profesional',
      email: u.email,
      avatarFile: u.avatarFile,
      profession: u.profession || 'Profesional de la salud',
      businessName: u.businessName || 'Consultorio particular',
      providerStatus: u.providerStatus,
      phone: u.phone,
      especialidades: this.parseJson(u.especialidades),
      modalidadAtencion: this.parseJson(u.modalidadAtencion),
      zonaAtencion: this.parseJson(u.zonaAtencion),
      rating: u.rating || Math.round(Math.random() * 10) / 2 + 3.5,
      price: u.price || Math.floor(Math.random() * 30) + 20,
      Biography: u.Biography,
      gender: u.gender,
      lat: Number(u.lat),
      lng: Number(u.lng),
      isOnline: !!u.isOnline,
      
    }));

    this._professionals$.next(processed);
    console.log('✅ Profesionales procesados y emitidos:', processed);
  } catch (error) {
    console.error('❌ Error al cargar profesionales:', error);
    this._professionals$.next([]);
  }
}




  /** 🔹 Convertir campos JSON de PocketBase en arrays seguros */
  private parseJson(value: any): any[] {
    if (!value) return [];
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return [];
    }
  }

  /** 🔹 Obtener URL pública del avatar */
getAvatarUrl(user: Professional): string {
  if (!user.avatarFile) return 'assets/img/avatar.png';
  try {
    return pb.files.getURL(
      { collectionId: '_pb_users_auth_', id: user.id },
      user.avatarFile
    );
  } catch {
    return 'assets/img/avatar.png';
  }
}


  /** 🔹 Suscripción realtime (Server-Sent Events) */
  async subscribeRealtime(): Promise<void> {
    try {
      await pb.collection(this.collection).subscribe('*', (e) => {
        console.log('👀 Cambio detectado en profesionales:', e.action, e.record);
        // recarga datos tras crear/editar/eliminar
        this.loadProfessionals();
      });
      console.log('🔁 Suscripción realtime activa en:', this.collection);
    } catch (err) {
      console.error('❌ Error en suscripción realtime:', err);
    }
  }

  /** 🔹 Cancelar suscripción realtime */
  async unsubscribeRealtime(): Promise<void> {
    try {
      await pb.collection(this.collection).unsubscribe('*');
      console.log('🛑 Suscripción realtime cancelada');
    } catch (err) {
      console.error('⚠️ Error al cancelar suscripción realtime:', err);
    }
  }

 
async updateProfessionalStatus(id: string, data: Partial<Professional>) {
  try {
    const userId = id || pb.authStore.model?.id;
    if (!userId) throw new Error('No se encontró el ID del usuario autenticado');

    console.log('📝 Actualizando usuario con ID:', userId);
    return await pb.collection('users').update(userId, data);
  } catch (err) {
    console.error('❌ Error en updateProfessionalStatus:', err);
    throw err;
  }
}

getNearbyProfessionals(lat: number, lng: number, radiusKm: number) {
  const professionals = this._professionals$.value;

  console.log('📦 Total de profesionales en memoria:', professionals.length);

  if (!professionals?.length) return of([]);

  const activePros = professionals.filter(
    (p) => p.isOnline && p.lat != null && p.lng != null
  );

  console.log('🟢 Profesionales activos con coordenadas:', activePros.length);
  console.table(
    activePros.map((p) => ({
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      typeLat: typeof p.lat,
      typeLng: typeof p.lng,
      isOnline: p.isOnline,
    }))
  );

  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const nearby = activePros.filter((pro) => {
    // ✅ Asegurar que sean numéricos
    const plat = Number(pro.lat);
    const plng = Number(pro.lng);

    if (isNaN(plat) || isNaN(plng)) {
      console.warn(`⚠️ Coordenadas inválidas para ${pro.name}:`, pro.lat, pro.lng);
      return false;
    }

    const dLat = toRad(plat - lat);
    const dLng = toRad(plng - lng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) *
        Math.cos(toRad(plat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    console.log(`🧭 ${pro.name} → distancia: ${distance.toFixed(2)} km`);

    return distance <= radiusKm;
  });

  console.log('✅ Profesionales dentro del rango:', nearby.length);
  console.table(nearby);

  return of(nearby);
}


// Función Haversine para calcular distancia entre coordenadas
public haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = this.deg2rad(lat2 - lat1);
  const dLon = this.deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

private deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ✅ Obtener usuario autenticado (para el mapa o solicitudes)
getCurrentUser() {
  return pb.authStore.model;
}

// ✅ Verificar si el paciente tiene una solicitud pendiente
async hasPendingRequest(patientId: string): Promise<boolean> {
  const list = await pb.collection('appointments').getList(1, 1, {
    filter: `patient="${patientId}" && (status="pending" || status="in_progress")`,
  });
  return list?.items?.length > 0;
}
/** 🔥 Escucha en tiempo real las actualizaciones de citas */
  async listenAppointmentsRealtime() {
    try {
      await pb.collection('appointments').subscribe('*', (e) => {
        console.log('📡 Evento realtime recibido:', e);

        if (e.action === 'create') {
          const appointment = e.record;
          // Si el profesional autenticado es el asignado:
          if (appointment['professional'] === pb.authStore.model?.id) {
            console.log('🆕 Nueva solicitud recibida:', appointment);
            // Aquí puedes emitir un EventEmitter o signal para actualizar UI
          }
        }

        if (e.action === 'update') {
          const appointment = e.record;
          if (appointment['patient'] === pb.authStore.model?.id) {
            console.log('📢 Tu solicitud cambió de estado:', appointment['status']);
            // Puedes lanzar una notificación o cambiar vista
          }
        }
      });

    } catch (err) {
      console.error('❌ Error al suscribirse a realtime:', err);
    }
  }

  /** 🧩 Crear una solicitud de cita */
 async createRequest(data: {
  patient: string;
  professional: string;
  location: any;
  distanceKm: number;
  status: string;
}): Promise<any> {
  try {
    console.log('📤 Enviando solicitud:', data);

    const payload = {
      patient: data.patient,
      professional: data.professional,
      // 👇 Enviar objeto, no string
      location: data.location || {},
      distanceKm: data.distanceKm || 0,
      status: data.status || 'pending',
      details: 'Solicitud generada desde mapa'
    };

    const record = await pb.collection('appointments').create(payload);
    console.log('✅ Solicitud creada:', record);

    // Marcar profesional como ocupado
    await pb.collection('users').update(data.professional, { isOnline: false });

    return record;
  } catch (error: any) {
    console.error('❌ Error creando solicitud:', error);
    if (error.data) console.error('📋 Detalle del error:', error.data);
    throw error;
  }
}



}
