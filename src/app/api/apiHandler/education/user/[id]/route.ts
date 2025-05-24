import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/*
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: 'ID de usuario requerido'
      }, { status: 400 });
    }

    // Obtener todos los enlaces sociales del usuario
    const education = await prisma.education.findMany({
      where: { userId: id },
      orderBy: { startDate: 'asc' }
    });
    
    return NextResponse.json({ 
      success: true,
      education: education
    });

  } catch (error: any) {
    console.error("Error obteniendo enlaces sociales del usuario:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener enlaces sociales: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
} 
*/