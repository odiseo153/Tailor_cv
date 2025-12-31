import { SkillsHandler } from '@/app/Handler/PrismaHandler/SkillsHandler';
import { NextResponse } from 'next/server';

const skill_handler = new SkillsHandler();

export async function POST(request: Request) {
  try {
    const jsonData = await request.json();

    const { name, level, userId } = jsonData;


    if (!name || !level || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const objectData = {
      name: name as string,
      level: Number.parseInt(level as string, 10),
      userId: userId as string,
    };

    const resultado = await skill_handler.create(objectData);

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}


