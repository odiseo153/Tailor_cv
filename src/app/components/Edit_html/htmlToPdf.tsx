import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Añadir fuentes para mejorar la calidad
import "jspdf/dist/polyfills.es.js";

export const generatePdf = async (html: string) => {
  // Crear un contenedor para el renderizado
  const container = document.createElement("div");
  container.innerHTML = html;
  
  // Asegurar que el CSS de Tailwind esté cargado (si no está en el HTML)
  if (!html.includes("cdn.tailwindcss.com")) {
    const tailwindScript = document.createElement("script");
    tailwindScript.src = "https://cdn.tailwindcss.com";
    container.appendChild(tailwindScript);
    
    // Esperar a que Tailwind se cargue
    await new Promise(resolve => {
      tailwindScript.onload = resolve;
      setTimeout(resolve, 1000); // Timeout por seguridad
    });
  }
  
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
      
      /* Evitar cortes en secciones importantes */
      section {
        page-break-inside: avoid;
      }
      
      h2, h3 {
        page-break-after: avoid;
      }
      
      /* Asegurar que los bordes y colores se vean correctamente */
      .border-l-4 {
        border-left-width: 4px !important;
        border-left-style: solid !important;
      }
      
      .text-blue-600 {
        color: #2563eb !important;
      }
      
      .border-blue-600 {
        border-color: #2563eb !important;
      }
      
      /* Mejorar la legibilidad */
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
  
  // Añadir el contenedor al documento temporalmente
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);
  
  try {
    // Configuración de página A4
    const pageWidth = 210; // A4 ancho en mm
    const pageHeight = 297; // A4 alto en mm
    const margin = 10; // margen en mm
    
    // Asegurar que Tailwind ha terminado de aplicar estilos
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Renderizar con alta calidad
    const canvas = await html2canvas(container, {
      scale: 2, // Mayor escala para mejor resolución
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 794, // Ancho A4
      windowWidth: 794,
      onclone: (clonedDoc, clonedElement) => {
        // Asegurar que los estilos de Tailwind se aplican en el clon
        clonedElement.style.width = "794px";
        clonedElement.querySelectorAll('.border-l-4').forEach(el => {
          (el as HTMLElement).style.borderLeftWidth = "4px";
          (el as HTMLElement).style.borderLeftStyle = "solid";
          (el as HTMLElement).style.borderLeftColor = "#2563eb";
        });
      }
    });
    
    // Crear PDF con formato A4
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
        0,
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
          0,
          -position
        );
        
        heightLeft -= (pageHeight - (margin * 2));
        position += (pageHeight - (margin * 2));
      }
    }
    
    // Guardar el PDF
    pdf.save("cv.pdf");
    
    // Opcional: devolver el blob para uso adicional
    return {
      blob: pdf.output('blob'),
      pageCount: pageCount
    };
  } finally {
    // Limpiar
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

// Versión alternativa que divide el contenido en secciones para un mejor control
export const generateSectionedCvPdf = async (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Obtener las secciones principales
  const sections = Array.from(doc.querySelectorAll('section, header, footer'));
  
  // Configuración de página A4
  const pageWidth = 210; // mm
  const pageHeight = 297; // mm
  const margin = 10; // mm
  
  // Crear PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });
  
  let currentY = margin;
  let currentPage = 1;
  
  // Procesar el header primero
  const header = doc.querySelector('header');
  if (header) {
    const headerContainer = document.createElement('div');
    headerContainer.appendChild(header.cloneNode(true));
    document.body.appendChild(headerContainer);
    
    try {
      const canvas = await html2canvas(headerContainer, {
        scale: 2,
        backgroundColor: "#ffffff"
      });
      
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        currentY,
        imgWidth,
        imgHeight
      );
      
      currentY += imgHeight + 5; // 5mm de espacio
    } finally {
      document.body.removeChild(headerContainer);
    }
  }
  
  // Procesar cada sección
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].tagName.toLowerCase() === 'header') continue; // Ya procesamos el header
    
    const sectionContainer = document.createElement('div');
    sectionContainer.appendChild(sections[i].cloneNode(true));
    document.body.appendChild(sectionContainer);
    
    try {
      const canvas = await html2canvas(sectionContainer, {
        scale: 2,
        backgroundColor: "#ffffff"
      });
      
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Verificar si la sección cabe en la página actual
      if (currentY + imgHeight > pageHeight - margin) {
        pdf.addPage();
        currentPage++;
        currentY = margin;
      }
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        currentY,
        imgWidth,
        imgHeight
      );
      
      currentY += imgHeight + 5; // 5mm de espacio
    } finally {
      document.body.removeChild(sectionContainer);
    }
  }
  
  pdf.save("cv.pdf");
  return pdf;
};