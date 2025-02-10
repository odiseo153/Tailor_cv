import { NextResponse } from 'next/server';
import { CVHandler } from '../../Handler/CVHandler';

export const config = { runtime: 'edge' };

const cv_handler = new CVHandler();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const ofertaType = formData.get('ofertaType');
    const ofertaLaboral = formData.get('ofertaLaboral');
    const plantillaCV = formData.get('plantillaCV');
    const infoAdicional = formData.get('informacionAdicional');


    if (!ofertaType || !['text', 'pdf', 'image'].includes(ofertaType as string)) {
      return NextResponse.json({ error: 'Tipo de oferta laboral inválido.' }, { status: 400 });
    }

    let ofertaLaboralData: string | File | null = null;

    if (ofertaType === 'text') {
      if (typeof ofertaLaboral !== 'string') {
        return NextResponse.json({ error: 'Se esperaba texto para la oferta laboral.' }, { status: 400 });
      }
      ofertaLaboralData = ofertaLaboral;
    } else if (!(ofertaLaboral instanceof File)) {
      return NextResponse.json({ error: 'Se esperaba un archivo para la oferta laboral.' }, { status: 400 });
    } else {
      ofertaLaboralData = ofertaLaboral;
    }


    const resultado = await cv_handler.crearCV(ofertaLaboralData, ofertaType, plantillaCV as File,infoAdicional as string);

    return NextResponse.json({
      message: 'CV generado exitosamente',
      html: resultado.html,
    });

  } catch (error: any) {
    console.error("Error processing request in /api/generate:", error);
    return NextResponse.json({ error: 'Error al procesar la solicitud para generar el CV. Detalles: ' + (error.message || 'Error desconocido') }, { status: 500 });
  }
}
