import { NextResponse } from 'next/server';
import { EducationHandler } from '@/app/Handler/PrismaHandler/EducationHandler';

const education_handler = new EducationHandler();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de usuario requerido'
      }, { status: 400 });
    }

    // Obtener toda la educación del usuario usando el handler
    const result = await education_handler.get(id);

    if (!result.success) {
      throw new Error(typeof result.data === 'string' ? result.data : 'Error al obtener educación');
    }

    return NextResponse.json({
      success: true,
      education: result.data
    });

  } catch (error: any) {
    console.error("Error obteniendo educación del usuario:", error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener educación: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
}