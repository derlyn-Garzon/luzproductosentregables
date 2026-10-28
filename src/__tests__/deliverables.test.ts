import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  generateSecurePassword,
  hashPassword,
  verifyPassword,
  calculateEntregableStatus,
} from '../lib/auth';
import {
  getAllDeliverables,
  createDeliverable,
  getDeliverableById,
  updateDeliverable,
  deleteDeliverable,
  resetStorageForTesting,
} from '../lib/storage';

describe('Auth & Password Utilities', () => {
  test('generateSecurePassword generates expected length alphanumeric string', () => {
    const password = generateSecurePassword(12);
    assert.strictEqual(password.length, 12);
    assert.match(password, /^[A-Za-z0-9]+$/);
  });

  test('hashPassword and verifyPassword correctly validate matching password', async () => {
    const plain = 'SecretKey2025!';
    const hash = await hashPassword(plain);

    assert.notStrictEqual(plain, hash);
    const isValid = await verifyPassword(plain, hash);
    assert.strictEqual(isValid, true);

    const isInvalid = await verifyPassword('WrongPassword', hash);
    assert.strictEqual(isInvalid, false);
  });

  test('calculateEntregableStatus returns correct status badge classification', () => {
    const today = new Date();

    // 10 days in future -> a_tiempo
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 10);
    const futureStr = futureDate.toISOString().split('T')[0];
    assert.strictEqual(calculateEntregableStatus(futureStr), 'a_tiempo');

    // 2 days in future -> proximo_a_vencer
    const nearDate = new Date(today);
    nearDate.setDate(today.getDate() + 2);
    const nearStr = nearDate.toISOString().split('T')[0];
    assert.strictEqual(calculateEntregableStatus(nearStr), 'proximo_a_vencer');

    // 5 days in past -> vencido
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 5);
    const pastStr = pastDate.toISOString().split('T')[0];
    assert.strictEqual(calculateEntregableStatus(pastStr), 'vencido');
  });
});

describe('Deliverable Storage Handlers', () => {
  beforeEach(() => {
    resetStorageForTesting();
  });

  test('getAllDeliverables returns items sorted descending by created_at', async () => {
    const items = await getAllDeliverables();
    assert.strictEqual(items.length, 3);
    const firstDate = new Date(items[0].created_at).getTime();
    const secondDate = new Date(items[1].created_at).getTime();
    assert.ok(firstDate >= secondDate);
  });

  test('createDeliverable adds new deliverable to store', async () => {
    const input = {
      cliente_nombre: 'Cliente Test',
      nombre_producto: 'Producto Test',
      descripcion_breve: 'Descripcion Test',
      fecha_limite: '2026-12-31',
      imagen_url: 'data:image/png;base64,sample',
    };
    const hash = await hashPassword('TestPass123');
    const created = await createDeliverable(input, hash);

    assert.ok(created.id);
    assert.strictEqual(created.cliente_nombre, 'Cliente Test');

    const fetched = await getDeliverableById(created.id);
    assert.strictEqual(fetched?.id, created.id);
  });

  test('updateDeliverable modifies deliverable details', async () => {
    const updated = await updateDeliverable({
      id: 'entregable-1',
      cliente_nombre: 'Acme Corp Updated',
    });

    assert.strictEqual(updated?.cliente_nombre, 'Acme Corp Updated');
  });

  test('deleteDeliverable removes deliverable from store', async () => {
    const success = await deleteDeliverable('entregable-1');
    assert.strictEqual(success, true);

    const fetched = await getDeliverableById('entregable-1');
    assert.strictEqual(fetched, null);
  });
});
