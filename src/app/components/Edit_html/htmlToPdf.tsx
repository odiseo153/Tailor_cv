import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePdf = async (html: string): Promise<{ blob: Blob; pageCount: number } | void> => {
  // Se ejecuta solo en el cliente
  if (typeof window === "undefined") {
    console.warn("generatePdf: Este método debe ejecutarse en el cliente.");
    return;
  }

  // Crear contenedor y asignar el HTML (se espera que contenga código de Bootstrap)
  const container = document.createElement("div");
  container.innerHTML = html;

  // Configurar el contenedor para que se encuentre fuera de la vista pero en el DOM
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "794px"; // Ancho A4 en píxeles (~96 DPI)
  container.style.margin = "0";
  container.style.padding = "0";
  container.style.backgroundColor = "white";
  document.body.appendChild(container);

  // Inyectar estilos adicionales para impresión y evitar cortes en elementos importantes
  const style = document.createElement("style");
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

  try {
    // Esperar a que se apliquen los estilos (Bootstrap y los inyectados)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Configuración de la página A4 en mm
    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const margin = 10; // mm

    // Renderizar el contenedor a canvas con html2canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Escala para mayor resolución
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: container.clientWidth,
      windowWidth: container.clientWidth,
    });

    // Crear documento PDF con jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
      hotfixes: ["px_scaling"],
    });

    // Calcular dimensiones de la imagen en el PDF
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageCount = Math.ceil(imgHeight / (pageHeight - margin * 2));
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    // Añadir la imagen al PDF (manejando múltiples páginas si es necesario)
    if (pageCount <= 1) {
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);
      position += (pageHeight - margin * 2);
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight, undefined, "FAST", 0);
        heightLeft -= (pageHeight - margin * 2);
        position += (pageHeight - margin * 2);
      }
    }

    // Guardar el PDF
    pdf.save("cv.pdf");

    return {
      blob: pdf.output("blob"),
      pageCount,
    };
  } catch (error) {
    console.error("Error al generar el PDF:", error);
  } finally {
    // Limpiar el DOM: remover el contenedor temporal
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
