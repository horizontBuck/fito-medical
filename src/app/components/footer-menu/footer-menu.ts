import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';

@Component({
  selector: 'app-footer-menu',
    standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer-menu.html',
  styleUrl: './footer-menu.scss',
})
export class FooterMenu {
showHeader: boolean = true;

  constructor(private router: Router, private auth: AuthPocketbaseService) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeader = !event.url.includes('detail-profesional') && !event.url.includes('login') && !event.url.includes('register') && !event.url.includes('profile');
    });
  }
  get isLoggedIn() {
    return this.auth.isLoggedIn;
  }

  profileRoute(): string {
    const user = this.auth.currentUser;
    if (!user) return '/login';

    if (user['role'] === 'cliente') {
      return '/profile/patient/detail';
    } else if (user['role'] === 'proveedor') {
      return user['providerStatus'] === 'pending'
        ? '/profile/professional/settings'
        : '/profile/professional/detail';
    } else {
      return '/profile';
    }
  }
}
