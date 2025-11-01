import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../../services/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.scss',
})
export class ProfileDetail implements OnInit {

  user: any;

  constructor(
    private profileService: ProfileService
  ) {}

   ngOnInit() {
    this.profileService.userProfile$.subscribe(profile => {
      this.user = profile;
    });
  }
}
