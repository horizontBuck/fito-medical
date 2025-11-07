import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { ProfessionalsService } from '../../services/professionals.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  showHeader = true;
  user: any = null;
  currentLocation = 'Obteniendo ubicación...';
  private destroy$ = new Subject<void>();
  private locationChecked = false; // ⚡ Evita llamadas repetidas

  constructor(
    public router: Router,
    public authService: AuthPocketbaseService,
    public professionalsService: ProfessionalsService
  ) {}

  ngOnInit() {
    // Mostrar u ocultar el header según la ruta
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        const hideRoutes = [
          'login',
          'register',
          'maps',
          'edit-professional',
          'detail-profesional',
          'profile/settings',
          'profile/patient/detail',
          'profile/professional/edit',
          'profile/professional/edit-professional',
          'profile/professional/settings',
          'profile/professional/detail',
        ];
        this.showHeader = !hideRoutes.some((r) => event.url.includes(r));
      });

    // Escuchar el usuario actual (solo 1 vez por cambio de sesión)
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.user = user;

        if (!user) {
          this.currentLocation = 'No disponible';
          this.locationChecked = false;
          return;
        }

        // Solo si no lo hemos procesado antes
        if (!this.locationChecked) {
          this.locationChecked = true;

          if (user.role === 'proveedor') {
            await this.loadProfessionalLocation();
          } else if (user.role === 'cliente') {
            this.currentLocation = user.address || 'No disponible';
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

/** 🟢 Mostrar dirección real del profesional */
private async loadProfessionalLocation() {
  try {
    // 1️⃣ Si tiene coordenadas (más precisas), convertimos a dirección
    if (this.user.lat && this.user.lng) {
      const address = await this.reverseGeocode(this.user.lat, this.user.lng);
      this.currentLocation = address || 'Ubicación desconocida';
      return;
    }

    // 2️⃣ Si tiene una dirección guardada (manual o reverse)
    if (this.user.address && this.user.address.trim() !== '') {
      this.currentLocation = this.user.address;
      return;
    }

    // 3️⃣ Si no tiene dirección, usar la del consultorio solo como respaldo
    if (this.user.businessAddress && this.user.businessAddress.trim() !== '') {
      this.currentLocation = this.user.businessAddress;
      return;
    }

    // 4️⃣ Si no hay nada, obtener GPS y guardar dirección
    if (navigator.geolocation) {
      this.currentLocation = 'Obteniendo ubicación...';
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const address = await this.reverseGeocode(lat, lng);
      this.currentLocation = address || 'Ubicación desconocida';

      // 🔹 Guarda ubicación para uso futuro
      await this.authService.updateMyFields({
        lat,
        lng,
        address: address || '',
      });
    } else {
      this.currentLocation = 'Geolocalización no soportada';
    }
  } catch (error) {
    console.error('❌ Error al obtener ubicación del profesional:', error);
    this.currentLocation = 'Ubicación no disponible';
  }
}




  /** 🔵 Inversión de coordenadas → dirección */
  private async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsApiKey}&language=es`
      );
      const data = await res.json();
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address.split(',').slice(0, 2).join(',');
      }
      return null;
    } catch (err) {
      console.warn('Error en reverseGeocode:', err);
      return null;
    }
  }

  /** 🟣 Activar / desactivar disponibilidad profesional */
  async toggleOnlineStatus() {
    if (!this.user || this.user.role !== 'proveedor') return;
    try {
      const newStatus = !!this.user.isOnline;
      await this.professionalsService.updateProfessionalStatus(this.user.id, {
        isOnline: newStatus,
      });
      Swal.fire({
        title: newStatus ? 'Estás en línea 🟢' : 'Te has desconectado',
        text: newStatus
          ? 'Los pacientes podrán verte en el mapa.'
          : 'Ya no aparecerás como disponible.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('❌ Error al cambiar estado:', err);
      this.user.isOnline = !this.user.isOnline;
    }
  }

  /** 🔵 Obtener y guardar ubicación del paciente */
  async setPatientLocation() {
    if (!this.user || this.user.role !== 'cliente') return;

    Swal.fire({
      title: 'Obteniendo tu ubicación...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );

      const address = await this.reverseGeocode(
        pos.coords.latitude,
        pos.coords.longitude
      );
      this.currentLocation = address || 'Ubicación desconocida';

      await this.authService.updateMyFields({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        address: address || '',
      });

      Swal.fire({
        title: 'Ubicación actualizada ✅',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('❌ Error en setPatientLocation:', err);
      Swal.fire('Error', 'No se pudo obtener tu ubicación.', 'error');
    }
  }

  /** Navegar a edición de profesional */
  goToEditProfessional() {
    if (this.user?.role === 'proveedor') {
      this.router.navigate(['/profile/professional/edit-professional']);
    }
  }
}
