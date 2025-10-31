import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';

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

  async login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const { email, password } = this.form.value;

      // Login con PocketBase
      await this.auth.login(email, password);

      // Redirigir a offers
      this.router.navigate(['/']);
    } catch (err: any) {
      this.errorMsg = err?.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
