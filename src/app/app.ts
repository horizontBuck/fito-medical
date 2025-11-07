import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ScriptLoader } from './services/script-loader';
import { Header } from './components/header/header';
import { FooterMenu } from './components/footer-menu/footer-menu';
import { AuthPocketbaseService } from './services/auth-pocketbase.service';
import { environment } from './environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    Header,
    FooterMenu
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('fito');
  isLoggedIn = false;
  userRole: string | null = null;

    constructor(public scriptLoader: ScriptLoader, private router: Router, private auth: AuthPocketbaseService) { }
async ngOnInit() {
    // refresca si existe sesión válida en cookie
    const valid = await this.auth.initSession();
    this.isLoggedIn = valid;
    this.userRole = this.auth.currentUser?.['role'] ?? null;
    this.loadGoogleMaps();
  }

  private loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
navigateTo(route: string) {
  this.router.navigate([route]);
}

  async ngAfterViewInit(): Promise<void> {
    // Cargar solo los scripts necesarios para el carousel (jquery ya debería estar cargado en App)
    try {
      await this.scriptLoader.loadAll([
     
        { src: 'assets/js/plugins/swiper-bundle.min.js' , attr: { defer: 'true' } },
        { src: 'assets/js/plugins/bootstrap.js' , attr: { defer: 'true' } },
        { src: 'assets/js/main.js' , attr: { defer: 'true' } },
       
      ]);

      // Esperar micro-tick para asegurar que DOM está actualizado
    } catch (err) {
      console.error('Error cargando scripts en Home', err);
    }
  }


}
