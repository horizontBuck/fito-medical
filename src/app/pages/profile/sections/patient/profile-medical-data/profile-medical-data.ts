import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';
import Swal from 'sweetalert2';
import PocketBase from 'pocketbase';

@Component({
  selector: 'app-profile-medical-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-medical-data.html',
  styleUrl: './profile-medical-data.scss',
})
export class ProfileMedicalData implements OnInit {
  patientForm: FormGroup;
  isSaving = false;
  patientId: string | null = null;

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  private pb = new PocketBase('https://db.colombiatoursyexperiencias.online:8559');

  constructor(
    private fb: FormBuilder,
    private authService: AuthPocketbaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      weight: [null],
      height: [null],
      pregnancies: [null],
      blood_type: [''],
      blood_pressure: [''],
      allergies: [''],
      genetic_conditions: [''],
      surgeries: [''],
      chronic_diseases: [''],
      medications: [''],
      observations: ['']
    });
  }

  async ngOnInit() {
    // Obtener el usuario actual (paciente)
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (!this.patientId) {
      const currentUser = this.authService.currentUser;
      this.patientId = currentUser?.id || null;
    }

    // Cargar datos médicos si existen
    if (this.patientId) {
      await this.loadMedicalData();
    }
  }


  async loadMedicalData() {
    try {
      const record = await this.pb.collection('users').getOne(this.patientId!);
      this.patientForm.patchValue({
        weight: record['weight'],
        height: record['height'],
        pregnancies: record['pregnancies'],
        blood_type: record['blood_type'],
        blood_pressure: record['blood_pressure'],
        allergies: record['allergies'],
        genetic_conditions: record['genetic_conditions'],
        surgeries: record['surgeries'],
        chronic_diseases: record['chronic_diseases'],
        medications: record['medications'],
        observation: record['observation'],
      });
    } catch (error) {
      console.error('Error cargando datos médicos:', error);
      Swal.fire('Error', 'No se pudo cargar la ficha médica', 'error');
    }
  }

  async savePatient() {
  console.log('🩺 Intentando guardar...', this.patientId, this.patientForm.value);

  if (this.patientForm.invalid || !this.patientId) {
    this.patientForm.markAllAsTouched();
    return;
  }

  this.isSaving = true;
  try {
    const formData = { ...this.patientForm.value };

    // Asegurar que el campo observation siempre exista
    if (formData.observation === undefined || formData.observation === null) {
      formData.observation = '';
    }

    console.log('📤 Enviando a PB:', formData);

    await this.pb.collection('users').update(this.patientId, formData);

    Swal.fire({
      title: 'Ficha médica actualizada',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });

    this.router.navigate(['/profile/patient/settingsPatient']);
  } catch (error) {
    console.error('Error al guardar ficha médica:', error);
    Swal.fire('Error', 'No se pudo guardar la ficha médica', 'error');
  } finally {
    this.isSaving = false;
  }
}


  goBack() {
    this.router.navigate(['/profile/patient/settingsPatient']);
  }
}
