import { EducationHandler } from '@/app/Handler/PrismaHandler/EducationHandler';
import { NextResponse,NextRequest } from 'next/server';
import { prisma } from '@/lib/utils';
import { deleteImage, isOwnImageUrl } from '@/lib/uploads';


const education_handler = new EducationHandler();


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const jsonData = await request.json();
    
    // Ensure that a valid JSON payload was provided.
    if (!jsonData || typeof jsonData !== 'object') {
      return NextResponse.json({ error: 'El payload debe ser un objeto válido' }, { status: 400 });
    }
    
    const {id} = await params;
    const { institution, degree, startDate } = jsonData;
    
    // Check that all required fields are present.
    if (!institution || !degree || !startDate || !id) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }
    if (jsonData.image && !isOwnImageUrl(jsonData.image, jsonData.userId)) {
      return NextResponse.json({ error: 'Imagen inválida' }, { status: 400 });
    }
    
    const previous = await prisma.education.findUnique({ where: { id }, select: { image: true } });
    const resultado = await education_handler.update(id, jsonData);
    if (resultado.success && 'image' in jsonData && previous?.image !== (jsonData.image || null)) {
      await deleteImage(previous?.image);
    }

    if (!resultado.success) {
      return NextResponse.json(
        { error: typeof resultado.data === 'string' ? resultado.data : 'Education update failed', resultado },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ resultado });
  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para actualizar education: ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}



export async function DELETE(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) 
{
  try {
    const {id} =  await params;
    
    const previous = await prisma.education.findUnique({ where: { id }, select: { image: true } });
    const resultado = await education_handler.delete(id);
    if (resultado.success) await deleteImage(previous?.image);

    if (!resultado.success) {
      return NextResponse.json(
        { error: typeof resultado.data === 'string' ? resultado.data : 'Education delete failed', resultado },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ resultado });
    
  } catch (error: any) {
    console.error("Error processing request in /api/route:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para delete para work experience : ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
