import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../../services/profile.service';
import { Router, RouterModule } from '@angular/router';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';
import { ProfessionalsService } from '../../../../../services/professionals.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule,  RouterModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
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
    this.router.navigate(['/profile/professional/edit-personal']);
  }

  // Navigate to professional data edit
  editProfessionalProfile() {
    this.router.navigate(['/profile/professional/edit-professional']);
  }

  services() {
    this.router.navigate(['/profile/professional/services']);
  }

}
