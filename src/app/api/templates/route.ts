import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse,NextRequest } from 'next/server';
import { randomUUID } from 'crypto';


export async function GET(request: NextRequest) {
    try {
    
        const templates = [
        'src\\templates\\plantilla.html',
        'src\\templates\\plantilla2.html',
      ];
    
        const contentHtml = templates.map((templatePath) => {
            const fullPath = path.join(process.cwd(), templatePath);
            const content = fs.readFileSync(fullPath, 'utf8');
            return content;
        });
    
        return NextResponse.json({ contentHtml });
    
      } catch (error) {
        return NextResponse.json({ error: `Template not found ${error}` });
      }
  }


  
  export async function POST(request: NextRequest) {
    try {
      // Obtener el formData
      const formData = await request.formData();
      const file = formData.get("template") as File | null;
  
      if (!file) {
        return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
      }
  
      // Generar un nombre único para el archivo
      const uniqueFileName = `${randomUUID()}-${file.name}`;
  
      const upload = path.join(process.cwd(),'public','uploads');
      const filePath = path.join(upload,uniqueFileName);

      if(!fs.existsSync(upload)){
        fs.mkdirSync(upload);
      } 

      // Convertir el archivo a buffer y guardarlo en el servidor
      const fileBuffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(fileBuffer));
  
      return NextResponse.json({
        message: "Archivo guardado con éxito",
        fileName: uniqueFileName,
        filePath: `/uploads/${uniqueFileName}`,
      });
    } catch (error) {
      return NextResponse.json({ error: `Error al procesar el archivo: ${error}` }, { status: 500 });
    }
  }
  



