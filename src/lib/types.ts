export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  created_at: string;
}

export type EntregableStatus = 'a_tiempo' | 'proximo_a_vencer' | 'vencido';

export interface Entregable {
  id: string;
  cliente_id: string;
  cliente_nombre: string;
  nombre_producto: string;
  descripcion_breve: string;
  fecha_limite: string; // ISO YYYY-MM-DD
  imagen_url: string; // Base64 or object URL / path
  password_hash: string; // Bcrypt hashed password
  created_at: string; // ISO Timestamp
}

export interface CreateEntregableInput {
  cliente_nombre: string;
  nombre_producto: string;
  descripcion_breve: string;
  fecha_limite: string;
  imagen_url: string;
  custom_password?: string;
}

export interface UpdateEntregableInput {
  id: string;
  cliente_nombre?: string;
  nombre_producto?: string;
  descripcion_breve?: string;
  fecha_limite?: string;
  imagen_url?: string;
}

export interface EntregablePublicInfo {
  id: string;
  cliente_nombre: string;
  nombre_producto: string;
  descripcion_breve: string;
  fecha_limite: string;
  status: EntregableStatus;
  imagen_url?: string;
}
