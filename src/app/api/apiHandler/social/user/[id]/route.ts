import { NextResponse } from 'next/server';
import { SocialLinksHandler } from '@/app/Handler/PrismaHandler/SocialLinksHandler';

const social_handler = new SocialLinksHandler();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de usuario requerido'
      }, { status: 400 });
    }

    // Obtener todos los enlaces sociales del usuario usando el handler
    const result = await social_handler.get(id);

    if (!result.success) {
      throw new Error(typeof result.data === 'string' ? result.data : 'Error al obtener enlaces sociales');
    }

    return NextResponse.json({
      success: true,
      socialLinks: result.data
    });

  } catch (error: any) {
    console.error("Error obteniendo enlaces sociales del usuario:", error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener enlaces sociales: ' + (error.message || 'Error desconocido')
    }, { status: 500 });
  }
}