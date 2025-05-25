import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'ID de usuario requerido'
      }, { status: 400 });
    }

    // Obtener todas las habilidades del usuario
    const skills = await prisma.skill.findMany({
      where: { userId: id },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ 
      success: true,
      skills: skills
    });

  } catch (error: any) {
    console.error("Error obteniendo habilidades del usuario:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener habilidades: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
} 