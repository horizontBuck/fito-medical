import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile-edit',
  imports: [],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEdit {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }

}
