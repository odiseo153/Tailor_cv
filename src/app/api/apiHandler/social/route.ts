import { SocialLinksHandler } from '@/app/Handler/PrismaHandler/SocialLinksHandler';
import { NextRequest, NextResponse } from 'next/server';

const social_handler = new SocialLinksHandler();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const jsonData = data;
    
    const { platform, url, userId } = jsonData;

    
    if (!platform || !url || !userId) {
      return NextResponse.json({ error: 'Faltan parametros',params:jsonData }, { status: 400 });
    }

    const resultado = await social_handler.create(jsonData);

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
