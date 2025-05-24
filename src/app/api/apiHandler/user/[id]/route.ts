import { UserHandler } from '@/app/Handler/PrismaHandler/UserHandler';
import { NextResponse } from 'next/server';

const user_handler = new UserHandler();

export async function GET(request: Request,{ params }: { params: { id: string } }) {
  try {
    // Obtener el ID de usuario desde los parámetros de la URL
    const { id } =  params;

    const user = await user_handler.getById(id);

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      success: true,
      data: userWithoutPassword
    });

  } catch (error: any) {
    console.error("Error obteniendo datos de usuario:", error);
    return NextResponse.json({ 
      success: false,
      error: 'Error al procesar la solicitud: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
} 