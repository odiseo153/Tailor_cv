import { WorkExperienceHandler } from '@/app/Handler/PrismaHandler/WorkExperienceHandler';
import { NextResponse } from 'next/server';

const work_handler = new WorkExperienceHandler();

export async function POST(request: Request) {
  try {
    const Data = await request.json();

    if (!Data || !Data.formData) {
      return NextResponse.json({ error: 'Invalid request body: Missing Data or formData' }, { status: 400 });
    }

    console.log(Data);
    const jsonData = Data.formData;

    let { company, jobTitle, startDate, endDate, description, userId } = jsonData;
    
    if (!company || !jobTitle || !startDate || !endDate || !description || !userId) {
      return NextResponse.json({ error: 'Missing parameters', params: jsonData }, { status: 400 });
    }


    try {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
    } catch (dateError) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const resultado = await work_handler.create({
      company, jobTitle, startDate, endDate, description, userId
    });

    return NextResponse.json({ resultado }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing request in /api/apiWork/work:", error);
    return NextResponse.json({ error: 'Error processing request to save a work experience: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
