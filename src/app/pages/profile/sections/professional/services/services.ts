import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
   showForm = false;
  serviceForm: FormGroup;
  servicios: any[] = [];
  selectedImage: string | ArrayBuffer | null = null;
 constructor(private fb: FormBuilder) {
    this.serviceForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      descripcion: ['', Validators.required],
      imagen: ['']
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.selectedImage = reader.result;
      reader.readAsDataURL(file);
      this.serviceForm.patchValue({ imagen: file.name });
    }
  }

  addService() {
    if (this.serviceForm.valid) {
      const nuevoServicio = {
        ...this.serviceForm.value,
        imagen: this.selectedImage,
      };
      this.servicios.push(nuevoServicio);
      this.serviceForm.reset();
      this.selectedImage = null;
      this.showForm = false;
    }
  }

  deleteService(servicio: any) {
    this.servicios = this.servicios.filter(s => s !== servicio);
  }

}
