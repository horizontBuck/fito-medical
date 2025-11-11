import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import PocketBase from 'pocketbase';
import { ProfileService } from '../../../../../services/profile.service';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';
import { ProfessionalsService } from '../../../../../services/professionals.service';

const pb = new PocketBase('https://db.colombiatoursyexperiencias.online:8559');

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.scss',
})
export class ProfileDetail implements OnInit {
  user: any;
  professional: any;
  services: any[] = [];
  loadingServices = false;

  constructor(
    private profileService: ProfileService,
    private auth: AuthPocketbaseService,
    public profesionalService: ProfessionalsService,
    public router: Router
  ) {}

  ngOnInit() {
    // Cargar perfil del usuario actual
    this.profileService.userProfile$.subscribe(async (profile) => {
      this.user = profile;
      if (this.user?.id) {
        await this.loadServices(this.user.id);
      }
    });

    // Datos del profesional
    this.profesionalService.professionals$.subscribe((profile) => {
      this.professional = profile;
    });
  }

  /** ✅ Cargar servicios relacionados con este usuario */
  async loadServices(userId: string) {
    this.loadingServices = true;
    try {
      const records = await pb.collection('services').getFullList({
        filter: `idUser="${userId}" && active=true`,
        sort: '-created',
      });
      this.services = records;
      console.log('🩺 Servicios del profesional:', this.services);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
    } finally {
      this.loadingServices = false;
    }
  }

  /** ✅ Obtener URL de imagen del servicio */
  getServiceImage(service: any): string {
    if (!service.image) return 'assets/img/default-service.png';
    return pb.files.getUrl(service, service.image, { thumb: '100x100' });
  }

  /** ✅ Obtener ícono del servicio */
  getServiceIcon(icon: string): string {
    switch (icon) {
      case 'syringe':
        return '💉';
      case 'bandage':
        return '🩹';
      case 'monitor':
        return '🩺';
      case 'catheter':
        return '🧫';
      case 'glucometer':
        return '🩸';
      default:
        return '⚕️';
    }
  }

  /** ✅ Imagen del perfil */
  getProfileImage(): string {
    if (!this.professional) {
      return 'assets/img/default-avatar.png';
    }
    if (this.professional.avatarFile) {
      return this.profesionalService.getAvatarUrl(this.professional);
    }
    return 'assets/img/default-avatar.png';
  }
}
