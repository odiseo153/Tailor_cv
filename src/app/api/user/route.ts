import { NextResponse } from 'next/server';
import { UserHandler } from '@/app/Handler/UserHandler';

const user_handler = new UserHandler();

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const data = formData.get('data');
    const id = formData.get('id');

    if (!data) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 });
    }

    const objectData = JSON.parse(data?.toString());
  
    const resultado = await user_handler.update(id as string,objectData);

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
