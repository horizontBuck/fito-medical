import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { DetailProfesional } from './pages/detail-profesional/detail-profesional';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { Settings } from './pages/profile/sections/professional/settings/settings';
import { ProfileDetail } from './pages/profile/sections/professional/profile-detail/profile-detail';
import { Professional } from './pages/profile/sections/professional/professional';
import { ProfileEditProfessional } from './pages/profile/sections/professional/profile-edit-professional/profile-edit-professional';
import { ProfileEdit as ProfessionalProfileEdit } from './pages/profile/sections/professional/profile-edit/profile-edit';
import { ProfileEdit } from './pages/profile/sections/patient/profile-edit/profile-edit';
import { Patient } from './pages/profile/sections/patient/patient';
import { ProfileDetailPatient } from './pages/profile/sections/patient/profile-detail-patient/profile-detail-patient';
import { ProfileSettings } from './pages/profile/sections/patient/profile-settings/profile-settings';
import { Maps } from './pages/maps/maps';
import { from } from 'rxjs';
import { OrderTracking } from './pages/order-tracking/order-tracking';
import { Services } from './pages/profile/sections/professional/services/services';


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
    path: 'detail-profesional/:id',
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
  {
    path: 'order-tracking',
    component: OrderTracking,
    title: 'fito | Perfil',
    data: {
      description: 'Perfil en fito',
      canonical: '/profile',
    }
  },

  {
  path: 'profile',
  component: Profile,
  title: 'Perfil general',
  children: [
    {
      path: 'professional',
      component: Professional,
      children: [
        { path: '', redirectTo: 'detail', pathMatch: 'full' },
        { path: 'detail', component: ProfileDetail },
        { path: 'settings', component: Settings },
        { path: 'edit-personal', component: ProfessionalProfileEdit },
        { path: 'edit-professional', component: ProfileEditProfessional },
        { path: 'services', component: Services },
      ],
    },
    {
      path: 'patient',
      component: Patient,
      children: [
        { path: '', redirectTo: 'detail', pathMatch: 'full' },
        { path: 'detail', component: ProfileDetailPatient },
        { path: 'settingsPatient', component: ProfileSettings },
        { path: 'edit', component: ProfileEdit },
      ],
    },
    { path: '', redirectTo: 'patient', pathMatch: 'full' },
  ],
},

  {
    path: 'maps',
    component: Maps,
    title: 'fito | Mapas',
    data: {
      description: 'Mapas en fito',
      canonical: '/maps',
    },
  },  
];
