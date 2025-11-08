import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import Swal from 'sweetalert2';
import { pb } from '../../core/pocketbase.client';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
   form: FormGroup;
  showPwd = false;
  loading = false;
  errorMsg = '';

constructor(private router: Router,
    private fb: FormBuilder,
    private auth: AuthPocketbaseService
) {
   this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

/* async login() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMsg = '';

  try {
    const { email, password } = this.form.value;
    await this.auth.login(email, password);
    await this.auth.saveUserLocation();

    const user = this.auth.currentUser;
    if (!user) throw new Error('No se pudo obtener el usuario.');

    // === Redirección según rol ===
    if (user['role'] === 'cliente') {
      this.router.navigate(['/profile/patient/detail']);
      return;
    }

    if (user['role'] === 'proveedor') {
      if (user['providerStatus'] === 'pending') {
        // ⚠️ Mostrar aviso antes de redirigir
        Swal.fire('Tu cuenta está en revisión. Serás notificado cuando sea aprobada.');
        this.router.navigate(['/profile/professional/settings']);
      } else if (user['providerStatus'] === 'approved' || user['providerStatus'] === 'aprobado') {
        this.router.navigate(['/profile/professional/detail']);
      } else {
        this.router.navigate(['/profile/professional/settings']);
      }
      return;
    }
    localStorage.setItem('pb_auth', JSON.stringify(pb.authStore.exportToCookie()));

    // Default (roles no definidos)
    this.router.navigate(['/']);

  } catch (err: any) {
    console.error(err);
    this.errorMsg = err?.message || 'Error al iniciar sesión';
  } finally {
    this.loading = false;
  }
} */
async login() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMsg = '';

  try {
    const { email, password } = this.form.value;
    await this.auth.login(email, password);
    await this.auth.saveUserLocation?.();

    const user = this.auth.currentUser;
    if (!user) throw new Error('No se pudo obtener el usuario.');

    // === Redirección según rol ===
    if (user['role'] === 'cliente') {
      this.router.navigate(['/profile/patient/detail']);
    } else if (user['role'] === 'proveedor') {
      if (user['providerStatus'] === 'pending') {
        Swal.fire('Tu cuenta está en revisión. Serás notificado cuando sea aprobada.');
        this.router.navigate(['/profile/professional/settings']);
      } else {
        this.router.navigate(['/profile/professional/detail']);
      }
    } else {
      this.router.navigate(['/']);
    }

  } catch (err: any) {
    console.error('❌ Login error:', err);
    this.errorMsg = err?.message || 'Error al iniciar sesión';
  } finally {
    this.loading = false;
  }
}


}
