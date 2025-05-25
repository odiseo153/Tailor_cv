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

    // Obtener todos los enlaces sociales del usuario
    const socialLinks = await prisma.socialLink.findMany({
      where: { userId: id },
      orderBy: { platform: 'asc' }
    });

    return NextResponse.json({ 
      success: true,
      socialLinks: socialLinks
    });

  } catch (error: any) {
    console.error("Error obteniendo enlaces sociales del usuario:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener enlaces sociales: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
} 