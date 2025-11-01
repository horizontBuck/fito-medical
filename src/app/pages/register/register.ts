import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthPocketbaseService } from '../../services/auth-pocketbase.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { Validators } from '@angular/forms';
type type = 'cliente' | 'proveedor';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

/** Pasos: 1=Tipo, 2=Datos, 3=Términos+Selfie */
  currentStep: 1 | 2 | 3 = 1;

  selectedAccountType: type = 'cliente';

  loading = false;
  errorMsg = '';
  okMsg = '';
  showPwd = false;

  /** Preview local del avatar */
  avatarPreview: string | null = null;
  /** Límite de tamaño (por ejemplo 5MB) */
  public readonly AVATAR_MAX_MB = 5;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthPocketbaseService,
    private emailService: EmailService,
    private router: Router
  ) {
    this.form = this.fb.group({
      // Paso 1
      accountType: ['cliente', Validators.required],

      // Paso 2
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      rut: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      companyName: [''],

      // Paso 3
      avatarFile: [null, [Validators.required]],   // <- ahora es un File, no string
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      agree: [false, Validators.requiredTrue],
    }, { validators: this.passwordMatchValidator });
  }

  /** password === confirmPassword */
  private passwordMatchValidator(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { passwordMismatch: true } : null;
  }

  setAccountType(type: type) {
    this.selectedAccountType = type;
    this.form.get('accountType')!.setValue(type);
    this.applyCompanyValidators();
  }

  /** companyName obligatorio solo si es proveedor */
  private applyCompanyValidators() {
    const company = this.form.get('companyName')!;
    if (this.selectedAccountType === 'proveedor') {
      company.addValidators([Validators.required, Validators.minLength(2)]);
    } else {
      company.clearValidators();
      company.setValue('');
    }
    company.updateValueAndValidity();
  }

  next() {
    if (!this.isStepValid()) { this.touchStepControls(); return; }
    if (this.currentStep === 1) {
      this.applyCompanyValidators();
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
    }
  }

  back() {
    if (this.currentStep === 3) this.currentStep = 2;
    else if (this.currentStep === 2) this.currentStep = 1;
  }

  /** Validez por paso (alineado con el front) */
  isStepValid(): boolean {
    if (this.currentStep === 1) {
      return this.form.get('accountType')!.valid;
    }
    if (this.currentStep === 2) {
      const base = ['name', 'email', 'rut', 'phone'];
      if (this.selectedAccountType === 'proveedor') base.push('companyName');
      return base.every(c => this.form.get(c)!.valid);
    }
    // Paso 3
    const step3 = ['password', 'confirmPassword', 'agree', 'avatarFile'];
    const allValid = step3.every(c => this.form.get(c)!.valid);
    return allValid && !this.form.errors?.['passwordMismatch'];
  }

  /** Marca controles del paso para mostrar errores */
  private touchStepControls() {
    const m1 = ['accountType'];
    const m2 = ['name', 'email', 'rut', 'phone'];
    if (this.selectedAccountType === 'proveedor') m2.push('companyName');
    const m3 = ['password', 'confirmPassword', 'agree', 'avatarFile'];
    const map = { 1: m1, 2: m2, 3: m3 } as const;
    map[this.currentStep].forEach(c => this.form.get(c)?.markAsTouched());
  }

  /** Maneja selección de avatar (selfie) con validaciones de mimetype y tamaño */
  onAvatarSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = (input.files && input.files[0]) || null;

    if (!file) {
      this.form.get('avatarFile')!.setValue(null);
      this.avatarPreview = null;
      return;
    }

    // Validar tipo
    if (!/^image\//.test(file.type)) {
      this.errorMsg = 'El archivo debe ser una imagen válida.';
      this.form.get('avatarFile')!.setValue(null);
      this.avatarPreview = null;
      return;
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > this.AVATAR_MAX_MB) {
      this.errorMsg = `La imagen supera ${this.AVATAR_MAX_MB}MB. Selecciona otra.`;
      this.form.get('avatarFile')!.setValue(null);
      this.avatarPreview = null;
      return;
    }

    // OK: setear y generar preview
    this.form.get('avatarFile')!.setValue(file);
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  /** Envío final */
  async submit() {
    if (!this.isStepValid()) { this.touchStepControls(); return; }

    this.loading = true; this.errorMsg = ''; this.okMsg = '';
    try {
      // register.component.ts (en submit)
const dto = {
  name: (this.form.value.name || '').trim(),
  email: (this.form.value.email || '').trim(),
  password: this.form.value.password,
  passwordConfirm: this.form.value.confirmPassword,
  agree: this.form.value.agree,
  type: this.form.value.accountType,
  businessName: this.selectedAccountType === 'proveedor'
    ? (this.form.value.companyName || '').trim()
    : undefined,

  // 👇 Agregados (asegura que sean string)
  rut: String(this.form.value.rut || '').trim(),
  phone: String(this.form.value.phone || '').trim(),
} as const;

const avatarFile: File = this.form.value.avatarFile;

// ✅ una sola llamada que guarda todo (texto + imagen)
const user = await this.auth.register(dto, avatarFile);


      // (Opcional) Email de bienvenida
      // await firstValueFrom(this.emailService.sendWelcome({...}));

      this.router.navigate(['/']);

      this.okMsg = this.selectedAccountType === 'proveedor'
        ? 'Cuenta creada. Tu perfil profesional está pendiente de aprobación.'
        : '¡Cuenta creada con éxito!';
    } catch (e: any) {
      this.errorMsg = e?.message || 'Error en el registro.';
    } finally {
      this.loading = false;
    }
  }

}
