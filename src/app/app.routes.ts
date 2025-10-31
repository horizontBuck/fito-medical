import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { DetailProfesional } from './pages/detail-profesional/detail-profesional';

export const routes: Routes = [
         {
    path: '',
    component: Home,
    title: 'fito | Inicio',
    data: {
      description: 'Bienvenido a fito, tu app de servicio de salud',
      canonical: '/',
    },

  },
  {
    path: 'detail-profesional',
    component: DetailProfesional,
    title: 'fito | Detalle de profesional',
    data: {
      description: 'Detalle de profesional en fito',
      canonical: '/detail-profesional',
    },
  },
];
