import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
 user: any;
  
  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileService.userProfile$.subscribe(profile => {
      this.user = profile;
    });
  }

  editProfile() {
    this.router.navigate(['/profile/professional/edit']);
  }
}
