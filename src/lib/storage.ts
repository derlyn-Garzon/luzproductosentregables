import { Entregable, CreateEntregableInput, UpdateEntregableInput } from './types';
import { hashPassword, hashPasswordSync } from './auth';

// Helper SVG base64 image generator for sample deliverables
const createSampleSvgImage = (title: string, color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="${color}"/>
    <circle cx="400" cy="250" r="100" fill="rgba(255,255,255,0.2)"/>
    <path d="M 250 400 L 350 280 L 450 380 L 550 260 L 650 400 Z" fill="rgba(255,255,255,0.4)"/>
    <text x="400" y="480" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="400" y="520" font-family="sans-serif" font-size="20" fill="rgba(255,255,255,0.8)" text-anchor="middle">Entregable de Calidad HD</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// Initial in-memory seed deliverables
const INITIAL_DELIVERABLES: Entregable[] = [
  {
    id: 'entregable-1',
    cliente_id: 'cli-1',
    cliente_nombre: 'Acme Corp',
    nombre_producto: 'Rediseño de Identidad Visual',
    descripcion_breve: 'Paquete de logotipos, paleta de colores y manual de marca corporativo.',
    fecha_limite: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // 5 days in future -> a_tiempo
    imagen_url: createSampleSvgImage('Acme Corp - Identidad Visual', '#3b82f6'),
    password_hash: hashPasswordSync('Acme2025!'),
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'entregable-2',
    cliente_id: 'cli-2',
    cliente_nombre: 'Estudio Creativo Alpha',
    nombre_producto: 'Render 3D Arquitectónico',
    descripcion_breve: 'Perspectivas exteriores en alta resolución para proyecto de penthouse.',
    fecha_limite: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], // 1 day in future -> proximo_a_vencer
    imagen_url: createSampleSvgImage('Alpha - Render 3D', '#8b5cf6'),
    password_hash: hashPasswordSync('AlphaPass123'),
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'entregable-3',
    cliente_id: 'cli-3',
    cliente_nombre: 'Restaurante El Patio',
    nombre_producto: 'Fotografía Gastronómica de Menú',
    descripcion_breve: 'Fotografías retocadas en formato publicitario para menú digital e impreso.',
    fecha_limite: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago -> vencido
    imagen_url: createSampleSvgImage('El Patio - Menú Gourmet', '#ec4899'),
    password_hash: hashPasswordSync('Patio9988'),
    created_at: new Date(Date.now() - 864000000).toISOString(),
  },
];

// Global store in memory
let deliverablesStore: Entregable[] = [...INITIAL_DELIVERABLES];

export async function getAllDeliverables(): Promise<Entregable[]> {
  // Sort descending by created_at
  return [...deliverablesStore].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getDeliverableById(id: string): Promise<Entregable | null> {
  const item = deliverablesStore.find((d) => d.id === id);
  return item || null;
}

export async function createDeliverable(
  input: CreateEntregableInput,
  passwordHash: string
): Promise<Entregable> {
  const newDeliverable: Entregable = {
    id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    cliente_id: `cli-${Date.now()}`,
    cliente_nombre: input.cliente_nombre,
    nombre_producto: input.nombre_producto,
    descripcion_breve: input.descripcion_breve,
    fecha_limite: input.fecha_limite,
    imagen_url: input.imagen_url,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };

  deliverablesStore.unshift(newDeliverable);
  return newDeliverable;
}

export async function updateDeliverable(
  input: UpdateEntregableInput
): Promise<Entregable | null> {
  const index = deliverablesStore.findIndex((d) => d.id === input.id);
  if (index === -1) return null;

  const existing = deliverablesStore[index];
  const updated: Entregable = {
    ...existing,
    cliente_nombre: input.cliente_nombre ?? existing.cliente_nombre,
    nombre_producto: input.nombre_producto ?? existing.nombre_producto,
    descripcion_breve: input.descripcion_breve ?? existing.descripcion_breve,
    fecha_limite: input.fecha_limite ?? existing.fecha_limite,
    imagen_url: input.imagen_url ?? existing.imagen_url,
  };

  deliverablesStore[index] = updated;
  return updated;
}

export async function deleteDeliverable(id: string): Promise<boolean> {
  const initialLength = deliverablesStore.length;
  deliverablesStore = deliverablesStore.filter((d) => d.id !== id);
  return deliverablesStore.length < initialLength;
}

export function resetStorageForTesting(): void {
  deliverablesStore = [...INITIAL_DELIVERABLES];
}
