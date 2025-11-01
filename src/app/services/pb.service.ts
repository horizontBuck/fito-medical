import PocketBase, { RecordModel } from 'pocketbase';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Gallery, GalleryImage } from '../models/gallery.models';
import { Payment } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PbService {
  readonly pb = new PocketBase(environment.pocketbaseUrl);
    private readonly WALLET_COLLECTION = 'wallet';

  fileUrl(record: RecordModel, filename?: string) {
    if (!filename) return '';
    return this.pb.files.getUrl(record, filename);
  }
currentUserName: string | undefined;
  get currentUser(): any {
    return this.pb?.authStore?.model as any;
  }

  get currentUserId(): string {
    return this.currentUser?.id;
  }

  get currentUserDni(): string | undefined {
    // ajusta el nombre del campo si en PB no es "dni"
    return (this.currentUser?.dni as string) || undefined;
  }

  /** Upload genérico (lo usas para QR también) */
  async uploadImage(file: File, type?: string): Promise<GalleryImage> {
    const form = new FormData();
    form.append('image', file);
    if (type) form.append('type', type);
    const uid = this.currentUserId;
    if (uid) form.append('userId', uid);

    const record = await this.pb.collection('images').create(form);
    const url = this.pb.files.getUrl(record, record['image']);
    return { id: record.id, url, type };
  }

  async deleteImageRecord(imageId: string): Promise<void> {
    await this.pb.collection('images').delete(imageId);
  }

  // ====== GALERÍAS (igual que ya tenías) ======
  async getUserGalleries(userId: string): Promise<Gallery[]> {
    const user = await this.pb.collection('users').getOne(userId);
    const raw = (user as any).works;
    if (Array.isArray(raw)) return raw as Gallery[];
    try { return JSON.parse(raw ?? '[]'); } catch { return []; }
  }

  async setUserGalleries(userId: string, galleries: Gallery[]): Promise<void> {
    await this.pb.collection('users').update(userId, { works: galleries });
  }

  async getGalleryById(userId: string, galleryId: string): Promise<Gallery | null> {
    const galleries = await this.getUserGalleries(userId);
    return galleries.find(g => g.id === galleryId) || null;
  }

  async replaceGallery(userId: string, updated: Gallery): Promise<void> {
    const galleries = await this.getUserGalleries(userId);
    const idx = galleries.findIndex(g => g.id === updated.id);
    if (idx === -1) throw new Error('Galería no encontrada');
    galleries[idx] = updated;
    await this.setUserGalleries(userId, galleries);
  }

  async deleteGallery(userId: string, galleryId: string, deleteRemoteImages = false): Promise<void> {
    const galleries = await this.getUserGalleries(userId);
    const target = galleries.find(g => g.id === galleryId);
    const next = galleries.filter(g => g.id !== galleryId);

    if (deleteRemoteImages && target?.images?.length) {
      await Promise.allSettled(target.images.map(img => this.pb.collection('images').delete(img.id)));
    }
    await this.setUserGalleries(userId, next);
  }

  // ====== PAGOS ======
  async getUserPayments(userId: string): Promise<Payment[]> {
    const user = await this.pb.collection('users').getOne(userId);
    const raw = (user as any).payments;
    if (Array.isArray(raw)) return raw as Payment[];
    try { return JSON.parse(raw ?? '[]'); } catch { return []; }
  }

  async setUserPayments(userId: string, payments: Payment[]): Promise<void> {
    await this.pb.collection('users').update(userId, { payments });
  }

  async upsertPayment(userId: string, payment: Payment): Promise<void> {
    const arr = await this.getUserPayments(userId);
    const idx = arr.findIndex(p => p.id === payment.id);
    if (idx >= 0) arr[idx] = payment; else arr.unshift(payment);
    await this.setUserPayments(userId, arr);
  }

  async deletePayment(userId: string, paymentId: string, deleteQr = false): Promise<void> {
    const arr = await this.getUserPayments(userId);
    const p = arr.find(x => x.id === paymentId);
    const next = arr.filter(x => x.id !== paymentId);

    if (deleteQr && (p as any)?.qr?.id) {
      try { await this.pb.collection('images').delete((p as any).qr.id); } catch {}
    }
    await this.setUserPayments(userId, next);
  }

  async setDefaultPayment(userId: string, paymentId: string): Promise<void> {
    const arr = await this.getUserPayments(userId);
    for (const p of arr) p.isDefault = (p.id === paymentId);
    await this.setUserPayments(userId, arr);
  }

async getUserExpanded(userId: string) {
  return await this.pb.collection('users').getOne(userId, {
    expand: 'imageDni,licence',
  });
}

async updateUser(userId: string, data: any) {
  return await this.pb.collection('users').update(userId, data);
}

async getImageById(imageId: string) {
  return await this.pb.collection('images').getOne(imageId);
}


async getCategories(): Promise<any[]> {
  const res = await this.pb.collection('categories').getList(1, 200, { sort: '+order' });
  return res?.items ?? [];
}

async createRecord(collection: string, data: any) {
    return this.pb.collection(collection).create(data); // data puede ser FormData
  }


createWalletDeposit(data: {
  userId: string;
  amount: number;
  currency: 'pen';                 // según tu esquema
  method: 'agente' | 'yape' | 'plin';
  note?: string;
  receiptId?: string;
  receiptUrl?: string;
}) {
  const body: any = {
    userId: data.userId,
    kind: 'deposit',
    status: 'pending',
    amount: data.amount,
    currency: data.currency,               // 'pen' si así está en PB
    method: data.method,
    note: data.note || '',
  };
  if (data.receiptId) body.receipt = data.receiptId; // <— nombre del campo RELATION
  if (data.receiptUrl) body.receiptUrl = data.receiptUrl;

  return this.pb.collection(this.WALLET_COLLECTION).create(body);
}

listMyWalletEntries(
  userId: string,
  status?: 'pending' | 'approved' | 'rejected'
) {
  const parts = [`userId="${userId}"`];
  if (status) parts.push(`status="${status}"`);
  const filter = parts.join(' && ');

  return this.pb.collection(this.WALLET_COLLECTION).getList(1, 50, {
    filter,
    sort: '-created',
    expand: 'receipt',
  });
}

async computeBalance(userId: string): Promise<number> {
  const page = await this.pb.collection(this.WALLET_COLLECTION).getList(1, 200, {
    filter: `userId="${userId}" && status="approved"`,
    sort: '+created',
  });
  const items = page?.items || [];
  let balance = 0;
  for (const it of items) {
    if (it['kind'] === 'deposit') balance += Number(it['amount'] || 0);
  }
  return balance;
}



}
