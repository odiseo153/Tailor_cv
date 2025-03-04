import { useEffect, useRef } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePdf = async (html: string) => {
  // Asegurarse de que el código se ejecuta solo en el cliente
  if (typeof window === "undefined") {
    return;
  }

  // Crear un contenedor para el renderizado
  const container = document.createElement("div");
  container.innerHTML = html;

  // Aplicar estilos adicionales para asegurar la correcta visualización en PDF
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      body { 
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      section {
        page-break-inside: avoid;
      }
      
      h2, h3 {
        page-break-after: avoid;
      }
      
      .border-l-4 {
        border-left-width: 4px !important;
        border-left-style: solid !important;
        border-left-color: #2563eb !important;
      }
      
      .text-blue-600 {
        color: #2563eb !important;
      }
      
      .border-blue-600 {
        border-color: #2563eb !important;
      }
      
      .text-gray-700, .text-gray-600, .text-gray-800 {
        color: #000000 !important;
      }
    }
  `;
  container.appendChild(style);

  // Establecer dimensiones adecuadas
  container.style.width = "794px"; // Ancho A4 en píxeles a 96 DPI
  container.style.margin = "0";
  container.style.padding = "0";
  container.style.backgroundColor = "white";

  try {
    // Configuración de página A4
    const pageWidth = 210; // A4 ancho en mm
    const pageHeight = 297; // A4 alto en mm
    const margin = 10; // margen en mm

    // Asegurar que los estilos se hayan aplicado
    await new Promise(resolve => setTimeout(resolve, 500));

    // Renderizar con html2canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Mayor escala para mejor resolución
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 794, // Ancho A4
      windowWidth: 794
    });

    // Crear el PDF con jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
      hotfixes: ["px_scaling"]
    });

    // Calcular dimensiones manteniendo proporción
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Determinar si necesitamos múltiples páginas
    const pageCount = Math.ceil(imgHeight / (pageHeight - (margin * 2)));

    // Si el contenido cabe en una sola página
    if (pageCount <= 1) {
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        margin,
        imgWidth,
        imgHeight
      );
    } else {
      // Manejar múltiples páginas
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      // Primera página
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        margin,
        imgWidth,
        imgHeight,
        undefined,
        'FAST',
        -position
      );

      heightLeft -= (pageHeight - (margin * 2));
      position += (pageHeight - (margin * 2));

      // Páginas adicionales
      while (heightLeft > 0) {
        pdf.addPage();
        page++;

        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          margin,
          margin,
          imgWidth,
          imgHeight,
          undefined,
          'FAST',
          -position
        );

        heightLeft -= (pageHeight - (margin * 2));
        position += (pageHeight - (margin * 2));
      }
    }

    // Guardar el PDF
    pdf.save("cv.pdf");

    return {
      blob: pdf.output('blob'),
      pageCount: pageCount
    };
  } finally {
    // Limpiar
    // No es necesario limpiar el DOM, porque ya no estamos manipulando document
  }
};

