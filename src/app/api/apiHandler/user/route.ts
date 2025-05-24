import { UserHandler } from '@/app/Handler/PrismaHandler/UserHandler';
import { NextResponse } from 'next/server';

const user_handler = new UserHandler();

export async function PUT(request: Request) {
  try {
    const jsonData = await request.json();

    const {id,name,email,phone,password,location,profilePicture} = jsonData;

    if (!id) {
      return NextResponse.json({ error: 'El parametro "id" es requerido' }, { status: 400 });
    }
    
    console.log(jsonData)

    const resultado = await user_handler.update(id,jsonData);

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
