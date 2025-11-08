import { Component } from '@angular/core';
import { ProfileService } from '../../../../../services/profile.service';
import { Router } from '@angular/router';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';
import { ProfessionalsService } from '../../../../../services/professionals.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.scss',
})
export class ProfileSettings {
user: any;
  
  constructor(
    private profileService: ProfileService,
    private router: Router,
    public auth: AuthPocketbaseService,
    public professionalsService: ProfessionalsService
  ) {}

  ngOnInit() {
    this.profileService.userProfile$.subscribe(profile => {
      this.user = profile;
    });
  }

  // Navigate to personal data edit
  editPersonalProfile() {
    this.router.navigate(['/profile/professional/edit']);
  }

  // Navigate to professional data edit
  editProfessionalProfile() {
    this.router.navigate(['/profile/professional/edit-professional']);
  }
}
