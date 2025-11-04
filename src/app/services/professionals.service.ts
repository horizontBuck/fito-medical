import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
  biography?: string;
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

    pb.authStore.onChange(() => {
      console.log('🔐 Cambio de sesión → autenticado:', pb.authStore.isValid);
    });
  }

  /** 🔹 Cargar profesionales aprobados (SDK PocketBase) */
  async loadProfessionals(): Promise<void> {
    console.log('🔍 Cargando profesionales aprobados...');

    try {
      const records = await pb.collection(this.collection).getFullList<Professional>({
        filter: '(role = "proveedor" || role = "experto") && (providerStatus = "approved" || providerStatus = "aprobado")',
        sort: '-created',
        fields: 'id,name,email,avatarFile,profession,businessName,providerStatus,phone,especialidades,modalidadAtencion,zonaAtencion',
      });

      console.log(`📦 ${records.length} registros recibidos de PocketBase`);

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
        biography: u.biography,
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
  if (!user.avatarFile) return 'assets/img/default-avatar.png';
  try {
    return pb.files.getURL(
      { collectionId: '_pb_users_auth_', id: user.id },
      user.avatarFile
    );
  } catch {
    return 'assets/img/default-avatar.png';
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
}
