import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { ProfessionalsService } from '../../services/professionals.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  showHeader: boolean = true;
  user: any = null;
  constructor(private router: Router,
    public authService: AuthPocketbaseService,
    public professionalsService: ProfessionalsService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeader = !event.url.includes('detail-profesional') && !event.url.includes('login') && !event.url.includes('register') && !event.url.includes('profile') && !event.url.includes('profile-detail') && !event.url.includes('profile-edit') && !event.url.includes('profile-settings');
    });
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
}
