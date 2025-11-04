import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ProfileService } from '../../../../../services/profile.service';
import { CategoriesService } from '../../../../../services/categories.service';
import { Category, SubCategory } from '../../../../../interfaces/category.interface';

@Component({
  selector: 'app-profile-edit-professional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-edit-professional.html',
  styleUrl: './profile-edit-professional.scss',
})
export class ProfileEditProfessional implements OnInit {
  user: any = {};
  isSaving = false;
  categories: Category[] = [];
  selectedCategory: string = '';
  selectedSubcategory: string = '';

  constructor(
    private location: Location,
    private profileService: ProfileService,
    private router: Router,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit() {
    this.profileService.userProfile$.subscribe(profile => {
      if (profile) {
        this.user = { ...profile };

        // Garantiza que modalidadAtencion sea un array
        if (!Array.isArray(this.user.modalidadAtencion)) {
          this.user.modalidadAtencion = [];
        }

        // Cargar categorías y luego intentar preseleccionar
        this.loadCategories(() => {
          if (this.user.specialty) {
            this.setInitialCategoryAndSubcategory();
          }
        });
      }
    });
  }

  /** ✅ Cargar categorías desde PocketBase */
  loadCategories(onLoaded?: () => void) {
    this.categoriesService.listTop(50).subscribe({
      next: (categories) => {
        this.categories = categories;
        if (onLoaded) onLoaded();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  /** ✅ Detectar la categoría y subcategoría inicial del usuario */
  private setInitialCategoryAndSubcategory() {
    for (const category of this.categories) {
      if (!category.subs || category.subs.length === 0) continue;

      // Ya normalizadas, por lo tanto sub siempre es { id, name }
      const matchingSub = category.subs.find(
        (sub: SubCategory) =>
          sub.id === this.user.specialty || sub.name === this.user.specialty
      );

      if (matchingSub) {
        this.selectedCategory = category.id;
        this.selectedSubcategory = matchingSub.id;
        break;
      }
    }
  }

  /** ✅ Cambiar categoría (resetea la subcategoría seleccionada) */
  onCategoryChange() {
    this.selectedSubcategory = '';
    this.user.specialty = '';
  }

  /** ✅ Cambiar subcategoría (actualiza la especialidad del usuario) */
  onSubcategoryChange() {
    if (this.selectedSubcategory) {
      this.user.specialty = this.selectedSubcategory;
    }
  }

  /** ✅ Obtener las subcategorías de la categoría actual */
  getCurrentSubcategories(): SubCategory[] {
    if (!this.selectedCategory) return [];
    const category = this.categories.find(cat => cat.id === this.selectedCategory);
    return category?.subs || [];
  }

  /** ✅ Control de checkboxes de modalidad de atención */
  updateModalidadAtencion(option: string, event: any) {
    if (!this.user.modalidadAtencion) {
      this.user.modalidadAtencion = [];
    }

    if (event.target.checked) {
      if (!this.user.modalidadAtencion.includes(option)) {
        this.user.modalidadAtencion.push(option);
      }
    } else {
      const index = this.user.modalidadAtencion.indexOf(option);
      if (index > -1) {
        this.user.modalidadAtencion.splice(index, 1);
      }
    }
  }

  /** ✅ Guardar cambios en el perfil */
  async saveProfile() {
    if (this.isSaving) return;

    try {
      this.isSaving = true;

      const userToUpdate = {
        ...this.user,
        specialty: this.selectedSubcategory || this.user.specialty,
        modalidadAtencion: Array.isArray(this.user.modalidadAtencion)
          ? this.user.modalidadAtencion
          : [],
      };

      await this.profileService.updateProfile(userToUpdate);

      await Swal.fire({
        title: '¡Perfil actualizado con éxito!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: true,
      });

      this.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        title: 'Error al actualizar el perfil',
        icon: 'error',
        timer: 2000,
        showConfirmButton: true,
      });
    } finally {
      this.isSaving = false;
    }
  }

  /** ✅ Volver atrás */
  goBack() {
    this.location.back();
  }
}
