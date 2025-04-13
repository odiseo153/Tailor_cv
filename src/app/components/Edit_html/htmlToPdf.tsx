import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePdf = async (html: string): Promise<{ blob: Blob; pageCount: number } | void> => {
  if (typeof window === "undefined") return;

  // Configuración de dimensiones (en mm para A4)
  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;
  const MARGIN = 10;
  const PRINTABLE_WIDTH = A4_WIDTH - MARGIN * 2;
  const PRINTABLE_HEIGHT = A4_HEIGHT - MARGIN * 2;

  // Crear contenedor temporal con estilos para preservar Tailwind
  const container = document.createElement("div");
  container.style.cssText = `
    position: absolute;
    left: -9790px;
    width: ${PRINTABLE_WIDTH}mm;
    height: auto;
    background: white;
    padding: ${MARGIN}mm;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; /* Alinear con Tailwind defaults */
  `;

  // Inyectar HTML y aplicar estilos dinámicos
  container.innerHTML = `
    <style>
      /* Incluir estilos base de Tailwind para renderizado correcto */
      @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
      * {
        box-sizing: border-box;
      }
      body, html {
        margin: 0;
        padding: 0;
        width: 100%;
      }
      /* Asegurar que los elementos respeten el contenedor */
      .w-full, .max-w-full {
        max-width: ${PRINTABLE_WIDTH}mm !important;
      }
    </style>
    ${html}
  `;
  document.body.appendChild(container);

  try {
    // Esperar a que los estilos y el contenido se rendericen completamente
    await new Promise(resolve => setTimeout(resolve, 500)); // Aumentar tiempo para estilos dinámicos

    const canvas = await html2canvas(container, {
      scale: 3, // Mayor resolución para mejor calidad
      useCORS: true,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
      backgroundColor: "#ffffff",
      logging: true, // Para depuración si hay errores
      ignoreElements: (element) => element.tagName === "SCRIPT", // Ignorar scripts
      
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
      precision: 16, // Mayor precisión para alineación
    });

    // Calcular dimensiones de la imagen
    const imgData = canvas.toDataURL("image/jpeg", 0.95); // Alta calidad JPEG
    const imgRatio = canvas.width / canvas.height;
    const imgWidth = PRINTABLE_WIDTH;
    const imgHeight = imgWidth / imgRatio;
    const totalPages = Math.ceil(imgHeight / PRINTABLE_HEIGHT);

    let yPos = 0;
    let currentPage = 1;

    while (yPos < imgHeight) {
      const remainingHeight = imgHeight - yPos;
      const sectionHeight = Math.min(remainingHeight, PRINTABLE_HEIGHT);

      /*
      if (currentPage > 1) {
        pdf.addPage();
      }
      */

      // Añadir imagen con coordenadas precisas
      pdf.addImage(
        imgData,
        "JPEG",
        MARGIN,
        MARGIN - (yPos * (PRINTABLE_HEIGHT / imgHeight) * (canvas.height / imgHeight)),
        imgWidth,
        sectionHeight,
        undefined,
        "FAST",
        0
      );

      yPos += sectionHeight;
      currentPage++;
    }

    // Generar blob y descargar
    const blob = pdf.output("blob");
    if (process.env.NODE_ENV !== "test") {
      pdf.save("cv.pdf");
    }

    return { blob, pageCount: totalPages };
  } catch (error) {
    console.error("Error generando PDF:", error);
    throw error; // Propagar error para manejo externo
  } finally {
    if (container.parentNode) {
      container.remove();
    }
  }
};

/*
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent -H "Content-Type: application/json" -H "X-Goog-Api-Key: AIzaSyDyiEsAP5m1AG5bqYOyfn9KBR6PBdrpw74" -d '{"generationConfig":{},"safetySettings":[],"contents":[{"role":"user","parts":[{"text":"Testing. Just say hi and nothing else."}]}]}'
*/