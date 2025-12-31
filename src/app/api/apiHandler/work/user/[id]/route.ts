import { NextResponse } from 'next/server';
import { WorkExperienceHandler } from '@/app/Handler/PrismaHandler/WorkExperienceHandler';

const work_handler = new WorkExperienceHandler();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de usuario requerido'
      }, { status: 400 });
    }

    // Obtener todas las experiencias laborales del usuario usando el handler
    const result = await work_handler.get(id);

    if (!result.success) {
      throw new Error(typeof result.data === 'string' ? result.data : 'Error al obtener experiencias');
    }

    return NextResponse.json({
      success: true,
      experiences: result.data
    });

  } catch (error: any) {
    console.error("Error obteniendo experiencias del usuario:", error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener experiencias: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
}