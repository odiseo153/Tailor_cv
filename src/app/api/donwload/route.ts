import { NextResponse, NextRequest } from 'next/server';
import pdf from 'html-pdf';
import { jsPDF } from 'jspdf';

export async function POST(request: NextRequest) {
    try {
        const { html, method="jspdf" } = await request.json();
        
        let pdfBuffer: Buffer;
        let success = false;

        // Método 1: Generación con html-pdf (servidor)
        if (method === 'html-pdf') {
            const options: pdf.CreateOptions = {
                format: 'A4',
                orientation: 'portrait',
                border: '10mm',
                timeout: 30000
            };

            pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
                pdf.create(html, options).toBuffer((err, buffer) => {
                    err ? reject(err) : resolve(buffer);
                });
            });
            
            success = true;
        }
        // Método 2: Generación con jsPDF (cliente)
        else if (method === 'jspdf') {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
                doc.html(html, {
                    callback: (doc) => {
                        const buffer = Buffer.from(doc.output('arraybuffer'));
                        resolve(buffer);
                        success = true;
                    },
                    margin: [10, 10, 10, 10],
                    windowWidth: 1200,
                    autoPaging: 'text'
                });
            });
        }
        else {
            return NextResponse.json(
                { error: 'Método no válido' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: success,
            message: 'PDF generado correctamente',
            pdfBuffer: pdfBuffer.toString('base64')
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        return NextResponse.json({
            success: false,
            message: `Error al generar el PDF: ${error}`
        }, { status: 500 });
    }
}