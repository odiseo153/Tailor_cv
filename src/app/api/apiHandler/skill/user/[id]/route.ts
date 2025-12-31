import { NextResponse } from 'next/server';
import { SkillsHandler } from '@/app/Handler/PrismaHandler/SkillsHandler';

const skills_handler = new SkillsHandler();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de usuario requerido'
      }, { status: 400 });
    }

    // Obtener todas las habilidades del usuario usando el handler
    const result = await skills_handler.get(id);

    if (!result.success) {
      throw new Error(typeof result.data === 'string' ? result.data : 'Error al obtener habilidades');
    }

    return NextResponse.json({
      success: true,
      skills: result.data
    });

  } catch (error: any) {
    console.error("Error obteniendo habilidades del usuario:", error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener habilidades: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
}