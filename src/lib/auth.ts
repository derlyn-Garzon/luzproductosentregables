import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EntregableStatus } from './types';

/**
 * Generates a cryptographically secure random alphanumeric password (8-12 characters).
 */
export function generateSecurePassword(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      password += chars[values[i] % chars.length];
    }
  } else {
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += chars[randomBytes[i] % chars.length];
    }
  }

  return password;
}

/**
 * Hashes a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Synchronous hash version for seed/test data.
 */
export function hashPasswordSync(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Calculates deadline status based on target date vs current date.
 * - 'vencido': deadline date is earlier than today
 * - 'proximo_a_vencer': deadline is within 3 days from today
 * - 'a_tiempo': deadline is more than 3 days in the future
 */
export function calculateEntregableStatus(fechaLimiteStr: string): EntregableStatus {
  if (!fechaLimiteStr) return 'a_tiempo';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = fechaLimiteStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'vencido';
  } else if (diffDays <= 3) {
    return 'proximo_a_vencer';
  } else {
    return 'a_tiempo';
  }
}
