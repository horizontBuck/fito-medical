import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapMarker, MapCircle } from '@angular/google-maps';
import { Router, NavigationEnd } from '@angular/router';
import { ProfessionalsService } from '../../services/professionals.service';
import { MapInfoWindow } from '@angular/google-maps';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapMarker, MapCircle, MapInfoWindow],
  templateUrl: './maps.html',
  styleUrl: './maps.scss',
})
export class Maps implements OnInit, AfterViewInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  @ViewChild('search') searchElementRef!: ElementRef;

  center: google.maps.LatLngLiteral = { lat: 4.711, lng: -74.0721 }; // Bogotá por defecto
  zoom = 14;
  selectedMarker: google.maps.LatLngLiteral | null = null;
  mapReady = false;

  // 🔹 Marcadores de profesionales activos
  nearbyPros: any[] = [];

  // 🔹 Radio visual de 10 km
  radius = 10000;

  selectedPro: any = null;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    public professionalsService: ProfessionalsService
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getPatientLocation();
      }
    });
  }

  ngAfterViewInit() {
    // Esperar a que Google Maps esté disponible
    const checkInterval = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps) {
        clearInterval(checkInterval);
        this.initMap();
      }
    }, 500);
  }

  /** 🔹 Inicializa la búsqueda y ubicación */
  private initMap() {
    this.getPatientLocation();

    // Configurar autocompletado
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
        this.zoom = 15;
        this.loadNearbyProfessionals();
      });
    });
  }

  /** 🔹 Obtener ubicación del paciente (usuario actual) */
  private getPatientLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.center = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          this.selectedMarker = this.center;
          this.loadNearbyProfessionals(); // 👈 busca pros al obtener ubicación
        },
        (err) => {
          console.warn('No se pudo obtener ubicación, usando Bogotá:', err);
          this.center = { lat: 4.711, lng: -74.0721 };
          this.loadNearbyProfessionals();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      console.warn('Geolocalización no soportada');
      this.loadNearbyProfessionals();
    }
  }

  /** 🔹 Cargar profesionales cercanos */
 private loadNearbyProfessionals() {
  console.log('📡 Buscando profesionales cerca de:', this.center);

  this.professionalsService
    .getNearbyProfessionals(this.center.lat, this.center.lng, 10)
    .subscribe((pros) => {
      console.log('👀 Profesionales recibidos del servicio:', pros);

      this.nearbyPros = pros.map((p) => ({
        ...p,
        distance: this.professionalsService.haversineDistance(
          this.center.lat,
          this.center.lng,
          Number(p.lat),
          Number(p.lng)
        ),
      }));

      console.log('📍 Profesionales dentro del radio (10 km):', this.nearbyPros);
    });
}

/** ✅ Muestra la info del profesional en un popup */
  openInfo(marker: MapMarker, pro: any) {
    this.selectedPro = pro;
    this.infoWindow.open(marker);
  }

  /** ✅ Navega al detalle del profesional */
  openProfessionalDetail(pro: any) {
    this.router.navigate(['/detail-profesional', pro.id]);
  }

}
