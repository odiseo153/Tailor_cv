import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePdf = async (html: string): Promise<{ blob: Blob; pageCount: number } | void> => {
  if (typeof window === "undefined") return;

  // Configuración de dimensiones
  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;
  const MARGIN = 10;
  const PRINTABLE_WIDTH = A4_WIDTH - MARGIN * 2;
  const PRINTABLE_HEIGHT = A4_HEIGHT - MARGIN * 2;

  // Crear contenedor
  const container = document.createElement("div");
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    width: ${PRINTABLE_WIDTH}mm;
    background: white;
  `;
  
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Calcular dimensiones
    const imgRatio = canvas.width / canvas.height;
    const imgWidth = PRINTABLE_WIDTH;
    const imgHeight = imgWidth / imgRatio;
    const totalPages = Math.ceil(imgHeight / PRINTABLE_HEIGHT);

    let yPos = 0;
    let currentPage = 1;

    while (yPos < imgHeight) {
      const remainingHeight = imgHeight - yPos;
      const sectionHeight = Math.min(remainingHeight, PRINTABLE_HEIGHT);
      const sourceY = (yPos / imgHeight) * canvas.height;
      const sourceHeight = (sectionHeight / imgHeight) * canvas.height;

      if (currentPage > 1) {
        pdf.addPage();
      }

      pdf.addImage(
        canvas,
        "JPEG",
        MARGIN,
        MARGIN - yPos,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
        0
      );

      /* 
      addImage(
      imageData: string | HTMLImageElement | HTMLCanvasElement | Uint8Array | RGBAData,
       format: string,
        x: number,
         y: number, 
         w: number, 
         h: number,
          alias?: string,
           compression?: ImageCompression,
            rotation?: number)
      */

      yPos += sectionHeight;
      currentPage++;
    }

    const blob = pdf.output("blob");
    pdf.save("cv-profesional.pdf");
    
    return { blob, pageCount: totalPages };
    
  } catch (error) {
    console.error("Error generando PDF:", error);
  } finally {
    container.remove();
  }
};