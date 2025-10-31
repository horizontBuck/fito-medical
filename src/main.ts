import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { App } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),      // 👈 habilita Router y ActivatedRoute
    provideHttpClient(),        // 👈 habilita HttpClient globalmente
    provideAnimations(),        // 👈 (opcional, pero recomendable)
  ],
}).catch(err => console.error(err));
