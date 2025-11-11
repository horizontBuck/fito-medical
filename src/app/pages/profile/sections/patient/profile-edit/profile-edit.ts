import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';
import Swal from 'sweetalert2';
import PocketBase from 'pocketbase';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.scss',
})
export class ProfileEdit implements OnInit {
  patientForm: FormGroup;
  isSaving = false;
  patientId: string | null = null;

  private pb = new PocketBase('https://db.colombiatoursyexperiencias.online:8559');

  constructor(
    private fb: FormBuilder,
    private authService: AuthPocketbaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      rut: ['', [Validators.required]],
      birthdate: ['', [Validators.required]],
      gender: ['', [Validators.required]]
    });
  }

  async ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id');

    // si el id viene por ruta, cargamos el registro
    if (this.patientId) {
      await this.loadPatientData();
    } else {
      // si no, usamos los datos del usuario autenticado
      const currentUser = this.authService.currentUser;
      if (currentUser) {
        this.patientForm.patchValue({
          name: currentUser['name'] || '',
          phone: currentUser['phone'] || '',
          email: currentUser['email'] || '',
          rut: currentUser['rut'] || '',
          birthdate: currentUser['birthdate'] || '',
          gender: currentUser['gender'] || ''
        });
        this.patientId = currentUser.id;
      }
    }
  }

  async loadPatientData() {
    try {
      const patient = await this.pb.collection('users').getOne(this.patientId!);
      this.patientForm.patchValue(patient);
    } catch (error) {
      console.error('Error loading patient data:', error);
      Swal.fire('Error', 'No se pudo cargar la información del paciente', 'error');
    }
  }

  async savePatient() {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    try {
      const patientData = this.patientForm.value;

      // Guardamos directamente sobre la colección "users" o "patients"
      if (this.patientId) {
        await this.pb.collection('users').update(this.patientId, patientData);
      } else {
        await this.pb.collection('users').create(patientData);
      }

      Swal.fire({
        title: this.patientId ? '¡Datos actualizados!' : '¡Paciente creado!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      this.router.navigate(['/profile/patient/detail']);
    } catch (error) {
      console.error('Error saving patient:', error);
      Swal.fire('Error', 'Hubo un problema al guardar la información', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  goBack() {
    this.router.navigate(['/profile/patient/detail']);
  }
}
