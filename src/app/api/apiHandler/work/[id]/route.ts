import { WorkExperienceHandler } from '@/app/Handler/PrismaHandler/WorkExperienceHandler';
import { NextResponse,NextRequest } from 'next/server';

const work_handler = new WorkExperienceHandler();

export async function PUT(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const jsonData = data.formData;

    const {company,jobTitle,startDate,endDate,description } = jsonData;
    
    if (!company || !jobTitle || !startDate || !description) {
      return NextResponse.json({ error: 'Faltan parametros',jsonData }, { status: 400 });
    }
    
    const resultado = await work_handler.update(id,jsonData);

    return NextResponse.json({ resultado });

  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para actualizar work : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing work experience ID' }, { status: 400 });
    }

    const resultado = await work_handler.delete(id);

    return NextResponse.json({ resultado });
  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para delete para work experience : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}


  export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }>  }) {
    try {
      const { id } = await params;
      if (!id) {
        return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
      }
  
      const resultado = await work_handler.get(id);
  
      return NextResponse.json({ resultado });
    } catch (error: any) {
      console.error("Error processing request in /api/route:", error);
      return NextResponse.json({ error: 'Error al procesar la solicitud para delete para work experience : ' + (error.message || 'Error desconocido') }, { status: 500 });
    }
}

