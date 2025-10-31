import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { DetailProfesional } from './pages/detail-profesional/detail-profesional';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

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
  {
    path: 'login',
    component: Login,
    title: 'fito | Iniciar sesión',
    data: {
      description: 'Iniciar sesión en fito',
      canonical: '/login',
    },
  },
  {
    path: 'register',
    component: Register,
    title: 'fito | Registrarse',
    data: {
      description: 'Registrarse en fito',
      canonical: '/register',
    },
  },
];
