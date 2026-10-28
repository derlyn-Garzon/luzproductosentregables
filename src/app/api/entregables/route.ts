import { NextRequest, NextResponse } from 'next/server';
import {
  getAllDeliverables,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  getDeliverableById,
} from '@/lib/storage';
import {
  generateSecurePassword,
  hashPassword,
  calculateEntregableStatus,
} from '@/lib/auth';
import { CreateEntregableInput, UpdateEntregableInput } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const deliverable = await getDeliverableById(id);
      if (!deliverable) {
        return NextResponse.json({ error: 'Entregable no encontrado' }, { status: 404 });
      }
      // Omit password_hash for safety in normal response unless client verification route
      const { password_hash, ...safeData } = deliverable;
      const status = calculateEntregableStatus(deliverable.fecha_limite);
      return NextResponse.json({ ...safeData, status });
    }

    const deliverables = await getAllDeliverables();
    const formatted = deliverables.map((d) => {
      const { password_hash, ...safeData } = d;
      return {
        ...safeData,
        status: calculateEntregableStatus(d.fecha_limite),
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateEntregableInput = await req.json();

    if (!body.cliente_nombre || !body.nombre_producto || !body.fecha_limite || !body.imagen_url) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar completos.' },
        { status: 400 }
      );
    }

    // Generate random secure password or use provided custom password
    const plainPassword = body.custom_password || generateSecurePassword(10);
    const passwordHash = await hashPassword(plainPassword);

    const created = await createDeliverable(body, passwordHash);

    const status = calculateEntregableStatus(created.fecha_limite);
    const { password_hash, ...safeCreated } = created;

    return NextResponse.json(
      {
        ...safeCreated,
        status,
        generatedPassword: plainPassword, // Return plaintext password ONLY once upon creation to show to Admin
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear entregable' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: UpdateEntregableInput = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: 'ID de entregable es requerido' }, { status: 400 });
    }

    const updated = await updateDeliverable(body);
    if (!updated) {
      return NextResponse.json({ error: 'Entregable no encontrado' }, { status: 404 });
    }

    const status = calculateEntregableStatus(updated.fecha_limite);
    const { password_hash, ...safeUpdated } = updated;

    return NextResponse.json({ ...safeUpdated, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar entregable' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de entregable es requerido' }, { status: 400 });
    }

    const success = await deleteDeliverable(id);
    if (!success) {
      return NextResponse.json({ error: 'Entregable no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entregable eliminado con éxito' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar entregable' }, { status: 500 });
  }
}
