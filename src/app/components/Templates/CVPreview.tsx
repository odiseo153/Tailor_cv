"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Eye } from "lucide-react"
import { PDFDocument, rgb } from "pdf-lib";
import {useState} from 'react';

interface CVTemplate {
  id: number
  name: string
  html: string
  image: string
  author: string
}

interface CVPreviewProps {
  template: CVTemplate
  onClick: () => void
}

export default function CVPreview({ template, onClick }: CVPreviewProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const generateThumbnail = async () => {
    // Usa la ruta correcta desde la carpeta public
    const pdfUrl = "73404be1-9a5f-4e63-84f8-b277c908a79e-Coderland -  Desarrollador NET - Odiseo Esmerlin Rincon Sanchez V1.pdf";
  
    try {
      // Realiza la solicitud para obtener el archivo PDF
      const response = await fetch(pdfUrl);
      
      // Verifica si la solicitud fue exitosa
      if (!response.ok) {
        console.error("Error al obtener el PDF:", response.status);
        return;
      }
  
      // Convierte la respuesta en un ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
  
      // Carga el PDF con pdf-lib
      const pdfDoc = await PDFDocument.load(arrayBuffer);
  
      // Obtén la primera página del PDF
      const page = pdfDoc.getPage(0);
  
      // Crea un lienzo (canvas) para renderizar la página
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
  
      if (!context) {
        console.error("No se pudo obtener el contexto del canvas.");
        return;
      }
  
      const scale = 0.2; // Escala para la miniatura
      const { width, height } = page.getSize();
  
      // Establece las dimensiones del lienzo según la escala
      canvas.width = width * scale;
      canvas.height = height * scale;
  
      // Usa el contexto del canvas para renderizar el PDF (esto requeriría un poco más de código para renderizar realmente la página con pdf-lib)
      // Aquí debes usar la librería adecuada para hacer un renderizado más completo, como pdf.js
  
      // Genera una URL de la imagen del lienzo (base64)
      const imageUrl = canvas.toDataURL();
  
      // Actualiza el estado con la imagen generada
      console.log(imageUrl)
      setThumbnail(imageUrl); // Asume que `setThumbnail` es un setter de estado
    } catch (error) {
      console.error("Error al procesar el PDF:", error);
    }
  };
  
  
  
  return (
    <div className="flex flex-col">
      <Card className="relative overflow-hidden cursor-pointer group" onClick={onClick}>
        <div className="aspect-[3/4] relative">
          <Image src={template.image || "/placeholder.svg"} alt={template.name} fill className="object-cover" />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white rounded-full p-2">
              <Eye className="w-5 h-5 text-gray-800" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center mt-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
          {template.author.charAt(0)}
        </div>
        <p className="ml-2 text-sm truncate">{template.name}</p>
      </div>
    </div>
  )
}

