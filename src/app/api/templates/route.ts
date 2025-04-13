import { promises as fs } from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { fromPath } from "pdf2pic" // npm install pdf2pic
import pdfParse from "pdf-parse"


export async function GET(request: NextRequest) {
  try {
    const uploadDir = path.join(process.cwd(), "public/uploads")
    const files = await fs.readdir(uploadDir)
    const pdfFiles = files
      .filter((file) => file.endsWith(".pdf"))
      .map((file) => ({
        name: file,
        pdfUrl: `/uploads/${file}`,
        pngUrl: files.includes(file.replace(".pdf", ".png"))
          ? `/uploads/${file.replace(".pdf", ".png")}`
          : null,
      }))

    return NextResponse.json({ pdfFiles })
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to read directory: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("template") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public/uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    const pdfName = `${randomUUID()}-${file.name}`
    const pdfPath = path.join(uploadDir, pdfName)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(pdfPath, fileBuffer)

    // Convertir PDF a PNG (primera página)
    const convert = fromPath(pdfPath, {
      width: 595,
      height: 842,
      density: 72,
      saveFilename: pdfName.replace(".pdf", ""),
      savePath: uploadDir,
      format: "png",
      quality: 80,
    })
    const { path: pngPath } = await convert(1, { responseType: "image" })

    // Convertir PDF a HTML
    const pdfData = await pdfParse(fileBuffer)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${file.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .pdf-content { white-space: pre-wrap; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="pdf-content">${pdfData.text.replace(/\n/g, "<br>")}</div>
      </body>
      </html>
    `
    const htmlName = `${pdfName.replace(".pdf", "")}.html`
    const htmlPath = path.join(uploadDir, htmlName)
    await fs.writeFile(htmlPath, htmlContent)

    return NextResponse.json({
      message: "Archivo procesado con éxito",
      pdfUrl: `/uploads/${pdfName}`,
      pngUrl: `/uploads/${path.basename(pngPath ?? "")}`,
      htmlUrl: `/uploads/${htmlName}`,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: `Error al procesar el archivo: ${error}` }, { status: 500 })
  }
}