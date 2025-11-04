import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';

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
    public authService: AuthPocketbaseService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeader = !event.url.includes('detail-profesional') && !event.url.includes('login') && !event.url.includes('register') && !event.url.includes('profile');
    });
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
}
