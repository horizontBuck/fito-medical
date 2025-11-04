import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../../services/profile.service';
import { CommonModule } from '@angular/common';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';
import { ProfessionalsService } from '../../../../../services/professionals.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.scss',
})
export class ProfileDetail implements OnInit {

  user: any;
  professional: any;
  constructor(
    private profileService: ProfileService,
    private auth: AuthPocketbaseService,
    public profesionalService: ProfessionalsService,
    public router: Router
  ) {}

   ngOnInit() {
    this.profileService.userProfile$.subscribe(profile => {
      this.user = profile;
    });
    this.profesionalService.professionals$.subscribe(profile => {
      this.professional = profile;
      });
  }
  getProfileImage(): string {
  if (!this.professional) {
    console.log('No hay datos del profesional');
    return 'assets/img/default-avatar.png';
  }
  
  const hasAvatar = !!this.professional.avatarFile;
  console.log('Tiene avatar:', hasAvatar, 'Datos:', this.professional);
  
  if (hasAvatar) {
    const url = this.profesionalService.getAvatarUrl(this.professional);
    console.log('URL del avatar:', url);
    return url;
  }
  
  return 'assets/img/default-avatar.png';
}
// En el componente
ngAfterViewInit() {
  console.log('Professional data:', this.professional);
  if (this.professional) {
    console.log('Avatar URL:', this.profesionalService.getAvatarUrl(this.professional));
  }
}
}
