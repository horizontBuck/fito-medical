export interface Professional {
  id: string;
  name: string;
  email: string;
  avatarFile?: string;
  profession?: string;
  businessName?: string;
  providerStatus?: string;
  rating?: number;
  price?: number;
  modalidadAtencion?: any[];
  zonaAtencion?: any[];
  especialidades?: any[];
  phone?: string;
  Biography?: string;
  category?: { id: string; name: string } | null; // ✅ Antes era string
  subcategory?: string;
  gender?: string;
  isOnline?: boolean;
  lat?: number;
  lng?: number;
}
