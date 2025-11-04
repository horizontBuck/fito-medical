import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../../services/profile.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';

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
    public auth: AuthPocketbaseService
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
