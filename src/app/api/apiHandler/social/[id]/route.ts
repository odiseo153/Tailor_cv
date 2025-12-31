import { SocialLinksHandler } from '@/app/Handler/PrismaHandler/SocialLinksHandler';
import { NextResponse,NextRequest } from 'next/server';

const social_handler = new SocialLinksHandler();

export async function PUT(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await request.json();
    const jsonData = data;
   const { id } = await params;

    const { platform, url, userId } = jsonData;

    if (!platform || !url || !userId) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 });
    }

    const resultado = await social_handler.update(id,jsonData);

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
