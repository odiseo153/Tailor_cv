import { EducationHandler } from '@/app/Handler/PrismaHandler/EducationHandler';
import { NextResponse } from 'next/server';

const education_handler = new EducationHandler();

export async function POST(request: Request) {
  try {
    const jsonData = await request.json();
    
    if (!jsonData || typeof jsonData !== 'object') {
      return NextResponse.json({ error: 'No se proporcionó un payload válido' }, { status: 400 });
    }
    
    const { institution, degree, startDate, endDate, userId } = jsonData;
    
    if (!institution || !degree || !startDate  || !userId) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 });
    }
    
    // Convertir las fechas a objetos Date
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : null;
    
    const resultado = await education_handler.create({
      institution,
      degree,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      userId
    });
    
    return NextResponse.json({ resultado });
    
  } catch (error: any) {
    console.error("Error processing request in /api/apiHandler/education:", error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud para crear un education: ' + (error.message || 'Error desconocido') },
      { status: 500 }
    );
  }
}
