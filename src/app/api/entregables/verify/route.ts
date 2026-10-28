import { NextRequest, NextResponse } from 'next/server';
import { getDeliverableById } from '@/lib/storage';
import { verifyPassword, calculateEntregableStatus } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const deliverable = await getDeliverableById(id);
    if (!deliverable) {
      return NextResponse.json(
        { error: 'El entregable solicitado no existe' },
        { status: 404 }
      );
    }

    const isMatch = await verifyPassword(password, deliverable.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta. Intente nuevamente.' },
        { status: 401 }
      );
    }

    const status = calculateEntregableStatus(deliverable.fecha_limite);
    const { password_hash, ...safeData } = deliverable;

    // Generate temporary session token timestamp
    const sessionToken = Buffer.from(
      JSON.stringify({ id: deliverable.id, exp: Date.now() + 3600000 })
    ).toString('base64');

    return NextResponse.json({
      success: true,
      deliverable: {
        ...safeData,
        status,
      },
      sessionToken,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al validar contraseña' },
      { status: 500 }
    );
  }
}
