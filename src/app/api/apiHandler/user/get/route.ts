import { UserHandler } from '@/app/Handler/PrismaHandler/UserHandler';
import { NextResponse } from 'next/server';

const user_handler = new UserHandler();

export async function GET(request: Request) {
  try {
    // Obtener el ID de usuario desde los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'El parámetro "id" es requerido'
      }, { status: 400 });
    }

    // Obtener los datos del usuario
    const user = await user_handler.getById(userId);

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 });
    }

    // Eliminar campos sensibles antes de enviar la respuesta
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