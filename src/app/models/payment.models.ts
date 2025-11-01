// Tipos de medios de pago comunes en Colombia
export type PaymentType = 'nequi' | 'daviplata' | 'bancolombia' | 'bank';

// Estructura base para todos los métodos
export interface BasePayment {
  id: string;                 // uuid local
  type: PaymentType;
  alias?: string;             // "Mi Nequi", "Cuenta principal", etc.
  isDefault?: boolean;        // marcar como método principal
  createdAt: string;          // ISO 8601
  updatedAt?: string;         // ISO 8601
}

/** Imagen o QR del medio de pago */
export interface WalletQR {
  id: string;     // id del registro en PocketBase (collection images)
  url: string;    // URL pública o firmada
  type?: string;  // 'qr' | 'screenshot'
}

/* ===============================
   🟣 Billeteras digitales (Nequi / Daviplata)
   =============================== */

export interface NequiPayment extends BasePayment {
  type: 'nequi';
  phone: string;               // formato internacional o nacional (ej: 3001234567)
  documentType?: 'CC' | 'CE' | 'NIT';
  documentNumber?: string;
  qr?: WalletQR;
}

export interface DaviplataPayment extends BasePayment {
  type: 'daviplata';
  phone: string;
  documentType?: 'CC' | 'CE' | 'NIT';
  documentNumber?: string;
  qr?: WalletQR;
}

/* ===============================
   🟡 Bancos tradicionales (incluye Bancolombia)
   =============================== */

export interface BancolombiaPayment extends BasePayment {
  type: 'bancolombia';
  accountType: 'ahorros' | 'corriente';
  accountNumber: string;           // número de cuenta
  holderName: string;
  documentType: 'CC' | 'CE' | 'NIT';
  documentNumber: string;
  bankBranch?: string;             // sucursal opcional
}

export interface BankPayment extends BasePayment {
  type: 'bank';
  bankName: 
    | 'Bancolombia'
    | 'Davivienda'
    | 'Banco de Bogotá'
    | 'Banco Agrario'
    | 'BBVA'
    | 'Banco de Occidente'
    | 'Scotiabank Colpatria'
    | 'Banco Popular'
    | 'Otro';
  accountType: 'ahorros' | 'corriente';
  accountNumber: string;
  holderName: string;
  documentType: 'CC' | 'CE' | 'NIT';
  documentNumber: string;
  cci?: string; // opcional para cuentas internacionales (ej: Swift/IBAN)
}

/* ===============================
   🔰 Tipo unificado
   =============================== */

export type Payment =
  | NequiPayment
  | DaviplataPayment
  | BancolombiaPayment
  | BankPayment;
