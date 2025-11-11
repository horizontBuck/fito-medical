import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import PocketBase from 'pocketbase';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';
import Swal from 'sweetalert2';

const pb = new PocketBase('https://db.colombiatoursyexperiencias.online:8559');

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements OnInit {
  showForm = false;
  serviceForm: FormGroup;
  servicios: any[] = [];
  selectedFile: File | null = null;
  loading = false;
  errorMsg = '';
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthPocketbaseService
  ) {
    this.serviceForm = this.fb.group({
  name: ['', Validators.required],
  price: ['', [Validators.required, Validators.min(0)]],
  description: ['', Validators.required],
  active: [true],
  icon: [''],
  requiresPrescription: [false],
});

  }

  async ngOnInit() {
    // ✅ Obtener usuario actual desde AuthPocketbaseService
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      console.warn('⚠️ No hay usuario autenticado.');
      return;
    }

    this.userId = currentUser.id;
    await this.loadServices();
  }

  /** ✅ Cargar servicios asociados al usuario autenticado */
  async loadServices() {
    if (!this.userId) return;
    try {
      const records = await pb.collection('services').getFullList({
        filter: `idUser="${this.userId}"`,
        sort: '-created',
        expand: 'idUser',
      });
      this.servicios = records;
      console.log('✅ Servicios cargados:', this.servicios);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.errorMsg = '';
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  /** ✅ Crear nuevo servicio con relación a idUser */
  async addService() {
    if (this.serviceForm.invalid || !this.userId) return;
    this.loading = true;

    try {
      const formData = new FormData();
      formData.append('name', this.serviceForm.value.name);
      formData.append('price', this.serviceForm.value.price);
      formData.append('description', this.serviceForm.value.description);
      formData.append('active', this.serviceForm.value.active);
      formData.append('icon', this.serviceForm.value.icon);
      formData.append('requiresPrescription', this.serviceForm.value.requiresPrescription);
      formData.append('idUser', this.userId!);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }


      const record = await pb.collection('services').create(formData);
      this.servicios.unshift(record);

      // Reset
      this.serviceForm.reset({ active: true });
      this.selectedFile = null;
      this.showForm = false;

      console.log('🆕 Servicio creado:', record);
    } catch (err: any) {
      console.error('Error al crear servicio:', err);
      this.errorMsg = err.message || 'Error al guardar el servicio.';
    } finally {
      this.loading = false;
    }
  }

  async deleteService(servicio: any) {
  const confirmResult = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar el servicio "${servicio.name}". Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
  });

  if (!confirmResult.isConfirmed) return;

  try {
    await pb.collection('services').delete(servicio.id);
    this.servicios = this.servicios.filter((s) => s.id !== servicio.id);

    await Swal.fire({
      title: 'Servicio eliminado',
      text: `"${servicio.name}" fue eliminado correctamente.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error('Error al eliminar servicio:', err);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo eliminar el servicio. Intenta nuevamente.',
      icon: 'error',
      confirmButtonText: 'Entendido',
    });
  }
}

  getImageUrl(servicio: any): string {
    if (!servicio.image) return 'assets/img/default-service.png';
    return pb.files.getUrl(servicio, servicio.image, { thumb: '100x100' });
  }
}
