import { NextResponse } from 'next/server';
import { UserHandler } from '@/app/Handler/PrismaHandler/UserHandler';

export const config = { runtime: 'edge' };

const user_handler = new UserHandler();

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    if (!formData.email || !formData.password) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 });
    }
    const resultado = await user_handler.create(formData);

    return NextResponse.json({resultado});

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
