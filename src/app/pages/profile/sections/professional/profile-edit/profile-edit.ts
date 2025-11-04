import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../../../services/profile.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEdit implements OnInit {
  user: any = {};
  isSaving = false;
  
  constructor(
    private location: Location,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load current user data
    this.profileService.userProfile$.subscribe(profile => {
      this.user = { ...profile };
      // Format the date for the input field (YYYY-MM-DD)
      if (this.user.birthdate) {
        const date = new Date(this.user.birthdate);
        this.user.birthdate = date.toISOString().split('T')[0];
      }
    });
  }

  goBack() {
    this.location.back();
  }

  async saveProfile() {
    if (this.isSaving) return;
    
    try {
      this.isSaving = true;
      // Create a copy of the user object to avoid modifying the original
      const userToUpdate = { ...this.user };
      
      // Convert the date string back to a Date object before saving
      if (userToUpdate.birthdate) {
        userToUpdate.birthdate = new Date(userToUpdate.birthdate).toISOString();
      }
      
      // The updateProfile method now updates the BehaviorSubject with the latest data
      await this.profileService.updateProfile(userToUpdate);
      Swal.fire({
        title: '¡Perfil actualizado con éxito!',
        icon: 'success',
        timer: 2000,  // Cierra automáticamente después de 2 segundos
        showConfirmButton: true
      }).then(() => {
         this.goBack();
      });
      // No need to manually update anything else, the BehaviorSubject will handle it
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        title: 'Error al actualizar el perfil',
        icon: 'error',
        timer: 2000,  // Cierra automáticamente después de 2 segundos
        showConfirmButton: true
      });
    } finally {
      this.isSaving = false;
    }
  }
}
