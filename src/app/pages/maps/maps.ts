import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { RouterLink } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker],
  templateUrl: './maps.html',
  styleUrl: './maps.scss',
})
export class Maps implements AfterViewInit {
 @ViewChild('search') searchElementRef!: ElementRef;

  zoom = 15;
  selectedMarker: google.maps.LatLngLiteral | null = null;
  mapReady = false;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  constructor(private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.center = { lat: 4.711, lng: -74.0721 }; // Bogotá por defecto
        this.zoom = 12;
        this.selectedMarker = null;
      }
    });
  }

  ngAfterViewInit() {
    // Esperar a que el script de Google Maps cargue
    const checkInterval = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps) {
        clearInterval(checkInterval);
        this.initMap();
      }
    }, 500);
  }

  private initMap() {
    // 1️⃣ Obtener ubicación actual del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.selectedMarker = this.center;
      }, () => {
        // Si falla, ubica en un punto genérico (opcional)
        this.center = { lat: 4.711, lng: -74.0721 };
      });
    }

    // 2️⃣ Configurar Autocomplete de búsqueda
    const autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement,
      { fields: ['geometry', 'name'] }
    );

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        this.center = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        this.selectedMarker = this.center;
        this.zoom = 16;
      });
    });
  }
}
