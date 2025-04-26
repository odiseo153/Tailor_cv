import { promises as fs } from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { fromPath } from "pdf2pic" // npm install pdf2pic

// Define base directories relative to the 'public' folder
const UPLOAD_SUBDIR = "uploads/templates"
const PDF_SUBDIR = path.join(UPLOAD_SUBDIR, "pdf")
const PNG_SUBDIR = path.join(UPLOAD_SUBDIR, "preview")

// Helper function to ensure directories exist
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch (error: any) {
    // Ignore error if directory already exists
    if (error.code !== 'EEXIST') {
      throw error // Re-throw other errors
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const pdfUploadDir = path.join(process.cwd(), "public", PDF_SUBDIR)
    const pngUploadDir = path.join(process.cwd(), "public", PNG_SUBDIR)

    // Ensure directories exist before reading
    await ensureDirectoryExists(pdfUploadDir)
    await ensureDirectoryExists(pngUploadDir)

    const pdfFilesList = await fs.readdir(pdfUploadDir)
    const pngFilesList = await fs.readdir(pngUploadDir) // Read PNG directory contents

    const pdfFiles = pdfFilesList
      .filter((file) => file.toLowerCase().endsWith(".pdf")) // Ensure case-insensitivity
      .map((pdfFile) => {
        const baseName = pdfFile.replace(/\.pdf$/i, "") // Get base name case-insensitively
        const pngFile = `${baseName}.png`
        const hasPngPreview = pngFilesList.some( // Check if corresponding PNG exists
          (f) => f.toLowerCase() === pngFile.toLowerCase()
        )

        return {
          id: baseName, // Use baseName as a unique ID for now
          name: pdfFile, // Use original filename as name
          pdfUrl: `/${PDF_SUBDIR}/${pdfFile}`, // Relative URL to the PDF
          pngUrl: hasPngPreview ? `/${PNG_SUBDIR}/${pngFile}` : undefined, // Relative URL to PNG if exists
          author: "Odiseo", // Placeholder author
        }
      })

    return NextResponse.json({ pdfFiles })
  } catch (error: any) {
    console.error("Error reading templates directory:", error) // Log the error server-side
    return NextResponse.json(
      { error: `Failed to read templates directory: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  let pdfPath: string | undefined; // Define pdfPath outside try for cleanup
  try {
    const formData = await request.formData();
    const file = formData.get("template") as File | null;

    if (!file || !(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "No valid PDF file received or file type is incorrect." },
        { status: 400 }
      );
    }

    const pdfUploadDir = path.join(process.cwd(), "public", PDF_SUBDIR);
    const pngUploadDir = path.join(process.cwd(), "public", PNG_SUBDIR);

    // Ensure directories exist before writing
    await ensureDirectoryExists(pdfUploadDir);
    await ensureDirectoryExists(pngUploadDir);

    // Generate a unique name to avoid conflicts
    const uniqueBaseName = randomUUID();
    const pdfName = `${uniqueBaseName}.pdf`;
    const pngName = `${uniqueBaseName}.png`; // Define PNG name

    pdfPath = path.join(pdfUploadDir, pdfName);
    const pngPath = path.join(pngUploadDir, pngName);
    const pngPathWithoutExt = path.join(pngUploadDir, uniqueBaseName); // Path for pdf2pic saveFilename

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(pdfPath, fileBuffer);

    let generatedPngPath: string | undefined;

    // --- Attempt to Convert PDF to PNG (first page) ---
    try {
      // Configure pdf2pic options
      const options = {
        density: 150, // Lower density for smaller preview file size (adjust as needed)
        saveFilename: uniqueBaseName, // Save PNG with the unique base name
        savePath: pngUploadDir, // Save PNG to the preview directory
        format: "png",
        width: 595, // Standard A4 width for consistency (adjust if needed)
        height: 842, // Standard A4 height
      };

      const convert = fromPath(pdfPath, options);
      // Convert only the first page (index 1)
      const conversionResult = await convert(1, { responseType: "image" });

      if (conversionResult && conversionResult.path) {
        generatedPngPath = conversionResult.path;
      } else {
        console.warn("PDF to PNG conversion did not return a valid path for:", pdfName);
        // No PNG path means conversion likely failed silently or partially
      }
    } catch (conversionError: any) {
      console.error("Error converting PDF to PNG for:", pdfName, conversionError);
      // Log the specific conversion error but don't stop the request
      // The frontend can handle the missing pngUrl
      if (conversionError.code === 'UNKNOWN' && conversionError.syscall === 'spawn') {
         console.error("This error often indicates that GraphicsMagick or ImageMagick is not installed or not in the system's PATH.");
      }
      generatedPngPath = undefined; // Ensure pngUrl is not set if conversion fails
    }

    // --- Prepare Response ---
    // Return data matching the frontend interface
    const newTemplateData = {
      id: uniqueBaseName,
      name: file.name, // Use original filename for display
      pdfUrl: `/${PDF_SUBDIR}/${pdfName}`,
      pngUrl: generatedPngPath ? `/${PNG_SUBDIR}/${path.basename(generatedPngPath)}` : undefined, // Use the actual generated filename or undefined
      author: "Odiseo", // Placeholder
    };

    return NextResponse.json(newTemplateData, { status: 201 }); // Use 201 Created status
  } catch (error: any) {
    console.error("Error processing template upload:", error);

    // Clean up the uploaded PDF if an error occurred after writing it
    if (pdfPath) {
      await fs.unlink(pdfPath).catch(e => console.error("Failed to delete PDF after upload error:", e));
    }

    // Provide a more generic error message to the client
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

    // Construct file paths
    const pdfPath = path.join(process.cwd(), 'public', PDF_SUBDIR, filename);
    
    // Look for any PNG files with the same baseId
    const pngUploadDir = path.join(process.cwd(), 'public', PNG_SUBDIR);
    let pngFiles: string[] = [];
    
    try {
      const allPngFiles = await fs.readdir(pngUploadDir);
      // Find PNG files that start with the same baseId (to handle different naming patterns)
      pngFiles = allPngFiles.filter(file => 
        file.toLowerCase().startsWith(baseId.toLowerCase()) && 
        file.toLowerCase().endsWith('.png')
      );
    } catch (error) {
      console.warn("Error reading PNG directory, continuing anyway:", error);
    }

    let pdfHandled = false; // True if PDF was deleted or didn't exist

    // Attempt to delete PDF
    try {
      await fs.unlink(pdfPath);
      console.log(`Deleted PDF: ${pdfPath}`);
      pdfHandled = true;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`PDF not found, skipping deletion: ${pdfPath}`);
        pdfHandled = true; // File not found is okay
      } else {
        console.error(`Error deleting PDF: ${pdfPath}`, error);
        // If PDF deletion fails for another reason, return error
        return NextResponse.json({ error: `Failed to delete PDF file: ${error.message}` }, { status: 500 });
      }
    }

    // Attempt to delete all matching PNG files
    for (const pngFile of pngFiles) {
      try {
        const pngPath = path.join(pngUploadDir, pngFile);
        await fs.unlink(pngPath);
        console.log(`Deleted PNG: ${pngPath}`);
      } catch (error: any) {
        console.warn(`Error deleting PNG: ${pngFile}`, error);
        // Log but continue - PNG deletion is best-effort
      }
    }

    // If PDF was successfully deleted or didn't exist, return success
    if (pdfHandled) {
       return NextResponse.json({ 
         message: `Template ${filename} deleted successfully, and ${pngFiles.length} preview files removed.` 
       }, { status: 200 });
    } else {
       // This case should not be reached with the current logic, but as a safeguard
       return NextResponse.json({ error: `Failed to delete template ${filename} due to an unhandled error` }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error processing template deletion:", error);
    return NextResponse.json(
      { error: `Error deleting file: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
