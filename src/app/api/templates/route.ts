import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import fs from 'fs';
import path from 'path';

// Esta función obtiene las plantillas de la carpeta pública
async function getTemplatesFromPublicFolder() {
  try {
    // Ruta completa al directorio de plantillas en la carpeta pública
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    
    // Verificar si el directorio existe
    let files = [];
    try {
      // Intentar leer el directorio
      files = await fs.promises.readdir(templatesDir);
    } catch (error) {
      // Si el directorio no existe, crear la estructura necesaria
      await fs.promises.mkdir(templatesDir, { recursive: true });
      console.log('Directorio templates creado en public');
      return []; // Devolver array vacío si acabamos de crear el directorio
    }
    
    // Filtrar archivos PDF
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    // Mapear los archivos a objetos de plantilla
    return pdfFiles.map(file => {
      const id = file.replace(/\.pdf$/i, '');
      return {
        id: id,
        name: file.replace(/\.pdf$/i, '').replace(/-/g, ' ').replace(/_/g, ' '),
        pdfUrl: `/templates/${file}`, // URL relativa al PDF
        pngUrl: `/templates/previews/${id}.png`, // URL relativa a la vista previa (si existe)
        author: "Odiseo"
      };
    });
  } catch (error) {
    console.error("Error leyendo directorio de plantillas:", error);
    return [];
  }
}

// Función para verificar si un archivo existe
async function fileExists(filePath: fs.PathLike) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obtener las plantillas del directorio
    const templates = await getTemplatesFromPublicFolder();
    
    return NextResponse.json({ pdfFiles: templates });
  } catch (error: any) {
    console.error("Error al leer plantillas:", error);
    return NextResponse.json(
      { error: `Error al obtener plantillas: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("template") as File | null;

    if (!file || !(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "No se recibió un archivo PDF válido o el tipo de archivo es incorrecto." },
        { status: 400 }
      );
    }

    // Generar un nombre de archivo único (preservando la extensión original)
    const fileExtension = path.extname(file.name);
    const fileName = `${randomUUID()}${fileExtension}`;
    
    // Ruta completa donde guardar el archivo
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    const filePath = path.join(templatesDir, fileName);
    
    // Asegurarse de que el directorio exista
    await fs.promises.mkdir(templatesDir, { recursive: true });
    
    // Convertir el archivo a un Buffer para guardarlo
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Guardar el archivo en el directorio de plantillas
    await fs.promises.writeFile(filePath, buffer);
    
    // Crear el objeto de respuesta
    const newTemplate = {
      id: fileName.replace(/\.pdf$/i, ''),
      name: file.name.replace(/\.pdf$/i, ''),
      pdfUrl: `/templates/${fileName}`,
      pngUrl: undefined, // No generamos vista previa
      author: "Odiseo"
    };
    
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error: any) {
    console.error("Error al procesar la carga de plantilla:", error);
    return NextResponse.json(
      { error: `Error al procesar el archivo: ${error.message || 'Error desconocido'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
  
    if (!filename) {
      return NextResponse.json({ error: 'Se requiere el parámetro de nombre de archivo' }, { status: 400 });
    }

    // Asegurarse de que el nombre del archivo tenga extensión .pdf
    const pdfFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    
    // Ruta completa al archivo a eliminar
    const filePath = path.join(process.cwd(), 'public', 'templates', pdfFilename);
    
    // Verificar si el archivo existe
    const exists = await fileExists(filePath);
    
    if (!exists) {
      return NextResponse.json({ 
        message: `No se encontró la plantilla ${filename}.` 
      }, { status: 404 });
    }
    
    // Eliminar el archivo
    await fs.promises.unlink(filePath);
    
    // También intentar eliminar la vista previa si existe
    const pngFilename = pdfFilename.replace(/\.pdf$/i, '.png');
    const pngPath = path.join(process.cwd(), 'public', 'templates', 'previews', pngFilename);
    
    try {
      if (await fileExists(pngPath)) {
        await fs.promises.unlink(pngPath);
      }
    } catch (error) {
      console.warn(`No se pudo eliminar la vista previa: ${pngPath}`);
    }
    
    return NextResponse.json({ 
      message: `Plantilla ${filename} eliminada correctamente.` 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error al procesar la eliminación de plantilla:", error);
    return NextResponse.json(
      { error: `Error al eliminar el archivo: ${error.message || 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
