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

    // Obtener todas las experiencias laborales del usuario
    const workExperiences = await prisma.workExperience.findMany({
      where: { userId: id },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json({ 
      success: true,
      experiences: workExperiences
    });

  } catch (error: any) {
    console.error("Error obteniendo experiencias del usuario:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener experiencias: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
} 