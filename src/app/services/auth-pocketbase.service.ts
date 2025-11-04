import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
const PB_URL = 'https://db.colombiatoursyexperiencias.online:8559';

export type Role = 'cliente' | 'proveedor' ;

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agree: boolean;
  type: 'cliente' | 'proveedor';
  businessName?: string; 
  rut: string;
  phone: string;
  avatarFile?: File;
}

@Injectable({ providedIn: 'root' })
export class AuthPocketbaseService {
  public pb = new PocketBase(PB_URL);
    currentUser$ = new BehaviorSubject<any>(null);

  // Claves de almacenamiento
  private STORAGE_KEY = 'pb_auth_cookie';
  private REMEMBER_KEY = 'pb_remember'; // '1' | '0'

  private listeners: Array<(loggedIn: boolean) => void> = [];

  constructor(private router: Router) {
    // Restaurar sesión desde localStorage o sessionStorage
    const saved =
      localStorage.getItem(this.STORAGE_KEY) ??
      sessionStorage.getItem(this.STORAGE_KEY) ??
      '';
    if (saved) this.pb.authStore.loadFromCookie(saved);

    // Persistir el token según preferencia "Recordarme"
    this.pb.authStore.onChange(() => {
      const cookie = this.pb.authStore.exportToCookie();
      const remember = (localStorage.getItem(this.REMEMBER_KEY) ?? '1') === '1';
      if (remember) {
        localStorage.setItem(this.STORAGE_KEY, cookie);
        sessionStorage.removeItem(this.STORAGE_KEY);
      } else {
        sessionStorage.setItem(this.STORAGE_KEY, cookie);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });
    // Listen to auth changes
    this.pb.authStore.onChange(() => {
      this.loadUser();
    });
  }
 private loadUser() {
    const user = this.pb.authStore.model;
    this.currentUser$.next(user ? { ...user } : null);
  }
  /** ¿Hay sesión válida? */
  get isLoggedIn(): boolean {
    return this.pb.authStore.isValid;
  }

  /** Usuario autenticado (o null) */
  get currentUser(): RecordModel | null {
    return this.pb.authStore.model;
  }

  /** Cerrar sesión y limpiar almacenamiento */
  logout(): void {
    this.pb.authStore.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  /** Iniciar sesión */
  async login(email: string, password: string, remember = true): Promise<RecordModel> {
    try {
      const auth = await this.pb.collection('users').authWithPassword(email, password);

      // Guardar preferencia y cookie
      localStorage.setItem(this.REMEMBER_KEY, remember ? '1' : '0');
      const cookie = this.pb.authStore.exportToCookie();

      if (remember) {
        localStorage.setItem(this.STORAGE_KEY, cookie);
        sessionStorage.removeItem(this.STORAGE_KEY);
      } else {
        sessionStorage.setItem(this.STORAGE_KEY, cookie);
        localStorage.removeItem(this.STORAGE_KEY);
      }

      return auth.record as RecordModel;
    } catch (err) {
      throw this.mapPocketbaseError(err);
    }
  }

  /**
   * Registrar cliente o proveedor, con soporte de avatar (selfie).
   * Si PB tiene "Only verified users can auth" activado, la autenticación posterior podría fallar hasta verificar email.
   */
 async register(dto: RegisterDto, avatarFile?: File): Promise<RecordModel> {
  if (!dto.agree) throw new Error('Debes aceptar los Términos y Condiciones.');
  if (dto.password !== dto.passwordConfirm) throw new Error('Las contraseñas no coinciden.');
  if (dto.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');

  const username = this.buildUsername(dto.email, dto.name);
  const form = new FormData();

  form.append('username', username);
  form.append('name', dto.name);
  form.append('email', dto.email);
  form.append('emailVisibility', 'true');
  form.append('password', dto.password);
  form.append('passwordConfirm', dto.passwordConfirm);
  form.append('role', dto.type);
  form.append('termsAccepted', 'true');
  form.append('rut', dto.rut);
  form.append('phone', dto.phone);

  if (dto.type === 'proveedor') {
    form.append('providerStatus', 'pending');
    if (dto.businessName) form.append('businessName', dto.businessName);
  }

  if (avatarFile) {
    console.log('🖼️ avatarFile info:', avatarFile.name, avatarFile.type, avatarFile.size);
    form.append('avatarFile', avatarFile, avatarFile.name);
  }

  for (const [k, v] of form.entries()) console.log(`📦 ${k}:`, v);

  try {
    const record = await this.pb.collection('users').create(form);
    try { await this.pb.collection('users').authWithPassword(dto.email, dto.password); } catch {}
    return await this.pb.collection('users').getOne(record.id);
  } catch (err: any) {
    console.error('❌ PocketBase raw error:', err);
    console.error('❌ PocketBase data error:', err?.data);
    throw this.mapPocketbaseError(err);
  }
}


  

  /** Subir/actualizar avatar en cualquier momento */
  async uploadAvatar(userId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await this.pb.collection('users').update(userId, formData);
      // refrescar el modelo en authStore si corresponde
      if (this.currentUser?.id === userId) {
        const rec = await this.pb.collection('users').getOne(userId);
        this.pb.authStore.save(this.pb.authStore.token, rec as any);
      }
    } catch (err) {
      throw this.mapPocketbaseError(err);
    }
  }

  /** Inicializar/renovar sesión si existe */
  async initSession(): Promise<boolean> {
    if (!this.isLoggedIn) return false;
    try {
      await this.pb.collection('users').authRefresh();
      return this.isLoggedIn;
    } catch {
      this.logout();
      return false;
    }
  }

  onAuthChange(cb: (loggedIn: boolean) => void) {
    this.listeners.push(cb);
  }

  getCurrentUserId(): string | null {
    return this.pb.authStore.model?.id ?? null;
  }

  async updateMyFields(patch: Partial<RecordModel>): Promise<RecordModel> {
    const id = this.getCurrentUserId();
    if (!id) throw new Error('No hay usuario autenticado.');
    const rec = await this.pb.collection('users').update(id, patch);
    this.pb.authStore.save(this.pb.authStore.token, rec as any);
    return rec;
  }

  async updateMyLocation(lat: number, long: number): Promise<RecordModel> {
    return this.updateMyFields({ lat, long } as any);
  }

  /** Helper: construir username legible y único */
  private buildUsername(email: string, name: string): string {
    const base = (name || email.split('@')[0] || 'user')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')     // elimina diacríticos
      .replace(/[^a-z0-9]+/g, '')          // solo alfanumérico
      .slice(0, 16);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base || 'user'}_${suffix}`;
  }

  /** Normaliza errores de PB a mensajes claros */
  private mapPocketbaseError(err: unknown): Error {
    const e = err as any;
    const payload = (e?.data ?? e?.response ?? {}) as {
      code?: number;
      message?: string;
      data?: Record<string, { code?: string; message?: string }>;
    };

    const status: number = e?.status ?? 0;
    const message: string = e?.message ?? payload?.message ?? 'Error';
    const fields = (payload?.data ?? {}) as Record<string, { code?: string; message?: string }>;

    if (status === 400) {
      if (fields['email']?.code === 'validation_invalid_email') return new Error('El email no es válido.');
      if (fields['email']?.code === 'validation_value_already_in_use') return new Error('Este email ya está registrado.');
      if (fields['username']?.code === 'validation_value_already_in_use') return new Error('El username ya está en uso.');
      if (fields['password']?.code) return new Error('La contraseña no cumple los requisitos.');
      if (fields['role']?.code) return new Error('Rol no permitido.');
    }

    const lower = (message || '').toLowerCase();
    if (lower.includes('failed to authenticate')) {
      return new Error('Credenciales inválidas o usuario no verificado.');
    }

    return new Error(message || 'No se pudo completar la operación.');
  }
}
