import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthPocketbaseService } from '../../../../../services/auth-pocketbase.service';

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
    
    if (this.patientId) {
      await this.loadPatientData();
    } else {
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
      }
    }
  }

  async loadPatientData() {
    try {
      // TODO: Implement patient data loading from your service
      // const patient = await this.patientService.getPatientById(this.patientId);
      // this.patientForm.patchValue(patient);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  }

  async savePatient() {
    if (this.patientForm.invalid) {
      return;
    }

    this.isSaving = true;
    try {
      const patientData = this.patientForm.value;
      
      if (this.patientId) {
        // Update existing patient
        // await this.patientService.updatePatient(this.patientId, patientData);
      } else {
        // Create new patient
        // await this.patientService.createPatient(patientData);
      }
      
      this.router.navigate(['/']); // Redirect to home or patient list
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      this.isSaving = false;
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
  
}