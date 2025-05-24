import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'ID de usuario requerido'
      }, { status: 400 });
    }

    // Obtener las preferencias de CV del usuario
    const preference = await prisma.cvPreferences.findFirst({
      where: { userId: id }
    });

    return NextResponse.json({ 
      success: true,
      preference: preference
    });

  } catch (error: any) {
    console.error("Error obteniendo preferencias de CV del usuario:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener preferencias: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
} 