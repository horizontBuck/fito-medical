import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer-menu',
    standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer-menu.html',
  styleUrl: './footer-menu.scss',
})
export class FooterMenu {
showHeader: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeader = !event.url.includes('detail-profesional');
    });
  }
}
