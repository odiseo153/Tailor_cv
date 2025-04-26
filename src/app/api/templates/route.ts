import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

// For vercel deployment
import { put, del, list } from '@vercel/blob';
import { revalidatePath } from "next/cache";

// Define base paths for URLs
const PDF_PATH_PREFIX = 'templates/pdf';
const PNG_PATH_PREFIX = 'templates/preview';

export async function GET(request: NextRequest) {
  try {
    // List all files in the templates directory
    const { blobs } = await list();
    
    // Filter for PDF files and their previews
    const pdfFiles = blobs
      .filter((blob: { pathname: string; }) => blob.pathname.startsWith(PDF_PATH_PREFIX) && blob.pathname.toLowerCase().endsWith('.pdf'))
      .map((pdfBlob: { pathname: string; url: any; }) => {
        const pdfFilename = pdfBlob.pathname.split('/').pop() || '';
        const baseName = pdfFilename.replace(/\.pdf$/i, '');
        
        // Look for corresponding PNG
        const pngPreview = blobs.find(
          (blob: { pathname: string; }) => blob.pathname.startsWith(PNG_PATH_PREFIX) && 
                   blob.pathname.includes(baseName) &&
                   blob.pathname.toLowerCase().endsWith('.png')
        );

        return {
          id: baseName,
          name: pdfFilename,
          pdfUrl: pdfBlob.url,
          pngUrl: pngPreview?.url,
          author: "Odiseo",
        }
      });

    return NextResponse.json({ pdfFiles });
  } catch (error: any) {
    console.error("Error reading templates:", error);
    return NextResponse.json(
      { error: `Failed to read templates: ${error.message}` },
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
        { error: "No valid PDF file received or file type is incorrect." },
        { status: 400 }
      );
    }

    // Generate a unique name to avoid conflicts
    const uniqueBaseName = randomUUID();
    const pdfName = `${uniqueBaseName}.pdf`;

    // Upload PDF to Vercel Blob Storage
    const pdfBlob = await put(`${PDF_PATH_PREFIX}/${pdfName}`, file, {
      access: 'public',
      addRandomSuffix: false, // We're already using UUID
    });

    // No PNG preview generation in serverless environment
    // In production, we'll skip the PNG preview generation since it requires ImageMagick/GraphicsMagick

    // Prepare the response
    const newTemplateData = {
      id: uniqueBaseName,
      name: file.name,
      pdfUrl: pdfBlob.url,
      pngUrl: undefined, // No preview in this implementation
      author: "Odiseo",
    };

    // Revalidate the path to update the UI
    revalidatePath('/templates');

    return NextResponse.json(newTemplateData, { status: 201 });
  } catch (error: any) {
    console.error("Error processing template upload:", error);
    return NextResponse.json(
      { error: `Error processing file: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
  
    if (!filename) {
      return NextResponse.json({ error: 'Filename parameter is required' }, { status: 400 });
    }

    // Extract baseId for checking if there's a PNG preview with the same ID
    const baseId = filename.replace(/\.pdf$/i, '');

    // List all blobs to find matching files
    const { blobs } = await list();
    
    // Find the PDF file to delete
    const pdfToDelete = blobs.find(
      (      blob: { pathname: string | string[]; }) => blob.pathname === `${PDF_PATH_PREFIX}/${filename}` || 
              blob.pathname.includes(baseId)
    );
    
    // Find any PNG previews to delete
    const pngsToDelete = blobs.filter(
      (      blob: { pathname: string; }) => blob.pathname.startsWith(PNG_PATH_PREFIX) && 
              blob.pathname.includes(baseId) &&
              blob.pathname.toLowerCase().endsWith('.png')
    );
    
    let deletedPdf = false;
    let deletedPngCount = 0;

    // Delete PDF if found
    if (pdfToDelete) {
      await del(pdfToDelete.url);
      deletedPdf = true;
    }

    // Delete all matching PNG files
    for (const pngBlob of pngsToDelete) {
      await del(pngBlob.url);
      deletedPngCount++;
    }

    // Revalidate the path to update the UI
    revalidatePath('/templates');

    return NextResponse.json({ 
      message: `Template ${deletedPdf ? 'deleted' : 'not found'}, and ${deletedPngCount} preview files removed.` 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing template deletion:", error);
    return NextResponse.json(
      { error: `Error deleting file: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
