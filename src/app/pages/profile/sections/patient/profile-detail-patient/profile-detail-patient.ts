import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';

@Component({
  selector: 'app-profile-detail-patient',
  standalone: true,
  imports: [CommonModule, RouterLink ],
  templateUrl: './profile-detail-patient.html',
  styleUrl: './profile-detail-patient.scss',
})
export class ProfileDetailPatient implements OnInit {
 paciente: any;

  constructor(public auth: AuthPocketbaseService, private router: Router) {}

  ngOnInit() {
    this.paciente = this.auth.currentUser;

    if (!this.paciente) {
      // si por alguna razón no hay sesión activa
      console.warn('No hay usuario autenticado');
    }
  }

  getAvatarUrl(): string {
    if (this.paciente?.avatar) {
      return this.auth.getAvatarUrl(this.paciente);
    }
    return 'assets/img/default-avatar.png';
  }
  goBack() {
  this.router.navigate(['/']);
}
edit() {
  this.router.navigate(['/profile/patient/edit']);
}


navigateToSettings() {
  this.router.navigate(['/profile/patient/settingsPatient']);
}

}


