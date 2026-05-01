import { NextRequest,NextResponse } from "next/server";
import { SkillsHandler } from '@/app/Handler/PrismaHandler/SkillsHandler';

const skill_handler = new SkillsHandler();
export async function PUT(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
  try {
    const jsonData = await request.json();
    const { id } =  await params;
    
    const { name, level } = jsonData;
    
    if (!name || !level ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const resultado = await skill_handler.update(id,jsonData);

    if (!resultado.success) {
      return NextResponse.json(
        { error: typeof resultado.data === 'string' ? resultado.data : 'Skill update failed', resultado },
        { status: 400 }
      );
    }

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) 
  {
  try {
    const { id } = await params;

    const resultado = await skill_handler.delete(id);

    if (!resultado.success) {
      return NextResponse.json(
        { error: typeof resultado.data === 'string' ? resultado.data : 'Skill delete failed', resultado },
        { status: 400 }
      );
    }

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para iniciar sesion : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
