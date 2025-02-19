import { NextResponse } from 'next/server';
import { UserHandler } from '@/app/Handler/UserHandler';
import { EducationHandler } from '@/app/Handler/EducationHandler';

const education_handler = new EducationHandler();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = formData.get('data');
    

    if (!data) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 });
    }

    const objectData = JSON.parse(data?.toString());
  
    const resultado = await education_handler.create(objectData);

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
