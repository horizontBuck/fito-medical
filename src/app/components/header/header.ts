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

  constructor(
    public router: Router,
    public authService: AuthPocketbaseService,
    public professionalsService: ProfessionalsService
  ) {}

  ngOnInit() {
    // 🔹 Oculta el header en pantallas específicas
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.showHeader =
          !event.url.includes('detail-profesional') &&
          !event.url.includes('login') &&
          !event.url.includes('register') &&
          !event.url.includes('profile') &&
          !event.url.includes('maps') &&
          !event.url.includes('edit-professional');
      });

    // 🔹 Escucha al usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;

        // ✅ Solo geolocaliza si hay sesión activa y es proveedor
        if (user && this.authService.isLoggedIn && user.role === 'proveedor') {
          this.getCurrentLocation();
        } else {
          this.currentLocation = 'No disponible';
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔹 Cambiar estado online del profesional
  async toggleOnlineStatus() {
    if (!this.user || this.user.role !== 'proveedor') return;

    try {
      const newStatus = !!this.user.isOnline;
      const userId = this.user.id;

      await this.professionalsService.updateProfessionalStatus(userId, {
        isOnline: newStatus,
      });

      Swal.fire({
        title: newStatus ? 'Estás en línea 🟢' : 'Te has desconectado',
        text: newStatus
          ? 'Ahora los pacientes podrán verte como disponible en el mapa.'
          : 'Ya no aparecerás como disponible.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('❌ Error actualizando estado:', err);
      this.user.isOnline = !this.user.isOnline;
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cambiar tu estado.',
        icon: 'error',
      });
    }
  }

  // 🔹 Obtener dirección actual
  async getCurrentLocation() {
    if (!navigator.geolocation) {
      this.currentLocation = 'Geolocalización no soportada';
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${environment.googleMapsApiKey}&language=es`
      );

      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        this.currentLocation = data.results[0].formatted_address.split(',').slice(0, 2).join(',');
      } else {
        this.currentLocation = 'Ubicación desconocida';
      }
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      this.currentLocation = 'No se pudo obtener la ubicación';
    }
  }

  // 🔹 Al hacer click en la imagen → ir a editar perfil profesional
 goToEditProfessional() {
  if (this.user?.role === 'proveedor') {
    this.router.navigate(['/profile', 'professional', 'edit-professional']);
  }
}
}
