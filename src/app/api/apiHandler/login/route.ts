import { NextResponse } from 'next/server';
import AuthHandler from '@/app/Handler/AuthHandler';

export const config = { runtime: 'edge' };

const auth_handler = new AuthHandler();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');


    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 });
    }

  
    const resultado = await auth_handler.login(email as string,password as string);

    return NextResponse.json({resultado});

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
