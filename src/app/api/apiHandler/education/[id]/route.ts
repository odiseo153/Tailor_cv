import { EducationHandler } from '@/app/Handler/PrismaHandler/EducationHandler';
import { NextResponse,NextRequest } from 'next/server';


const education_handler = new EducationHandler();


/*
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jsonData = await request.json();
    
    // Ensure that a valid JSON payload was provided.
    if (!jsonData || typeof jsonData !== 'object') {
      return NextResponse.json({ error: 'El payload debe ser un objeto válido' }, { status: 400 });
    }
    
    const id  =  params.id;
    const { institution, degree, startDate, endDate } = jsonData;
    
    // Check that all required fields are present.
    if (!institution || !degree || !startDate || !endDate || !id) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }
    
    console.log("Payload recibido para actualizar:", jsonData);
    const resultado = await education_handler.update(id, jsonData);
    
    return NextResponse.json({ resultado });
  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para actualizar education: ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}



export async function DELETE(request: NextRequest,{ params }: { params: { id: string } }) 
{
  try {
    const {id} =  params;
    
    const resultado = await education_handler.delete(id);
    
    return NextResponse.json({ resultado });
    
  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para delete para work experience : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
*/