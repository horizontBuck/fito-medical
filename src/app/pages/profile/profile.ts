import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { ProfileService } from '../../services/profile.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit, OnDestroy {
constructor(
    public router: Router,
    private auth: AuthPocketbaseService,
    private profileService: ProfileService
  ) {}

  user: any;
  showHeader = true;
  public routerSub!: Subscription;

   ngOnInit() {
    // Cargar perfil del usuario
    const userId = this.auth.getCurrentUserId();
    if (userId) {
      this.profileService.loadUserProfile(userId);
    }

    // Suscribirse a cambios de ruta
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Ocultar header en la ruta de edición
      this.showHeader = !event.url.includes('edit');
    });

    // Suscribirse a cambios en el perfil
    this.profileService.userProfile$.subscribe((profile: any) => {
      this.user = profile;
    });
  }

  ngOnDestroy() {
    // Importante: Limpiar la suscripción
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

}

