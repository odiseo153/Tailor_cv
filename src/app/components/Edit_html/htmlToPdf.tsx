import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePdf = async (html: string): Promise<{ blob: Blob; pageCount: number } | void> => {
  if (typeof window === "undefined") return;

  try {
    const container = document.createElement('div');
    container.innerHTML = html;
    
    // Configurar el contenedor para que renderice correctamente como un folio A4
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '794px'; // A4 ancho a 96DPI
    container.style.backgroundColor = 'white';
    // Aplicamos un padding simulando los márgenes de 10mm (aprox 38px)
    container.style.padding = '38px';
    
    document.body.appendChild(container);

    // Esperar a que se procesen las imágenes
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;
    let pageCount = 1;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      pageCount++;
    }

    const pdfBlob = pdf.output('blob');
    
    return { blob: pdfBlob, pageCount };
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};