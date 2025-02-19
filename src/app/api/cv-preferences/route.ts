import { NextResponse } from 'next/server';
import { WorkExperienceHandler } from '@/app/Handler/WorkExperienceHandler';

const work_handler = new WorkExperienceHandler();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = formData.get('data');
    

    if (!data) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 });
    }

    const objectData = JSON.parse(data?.toString());
  
    const resultado = await work_handler.create(objectData);

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
