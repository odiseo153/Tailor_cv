import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export const generatePdf = async (html: string) => {
  const element = document.createElement("div")
  element.innerHTML = html
  element.style.width = "800px"
  document.body.appendChild(element)

  try {
    // Renderizado con alta resolución
    const canvas = await html2canvas(element, {
      scale: 2,  // Aumenta la escala para mayor resolución (puedes ajustar este valor)
      useCORS: true, // Usar CORS para imágenes externas
      logging: false, // Desactivar el registro de consola (opcional)
    })
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF({
      orientation: "portrait",  // Ajustar orientación si es necesario
      unit: "mm",  // Unidades en milímetros
      format: "a4",  // Tamaño A4
    })

    // Ajusta el tamaño de la imagen en el PDF
    const pdfWidth = 210  // Ancho en mm (A4)
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width  // Mantener proporciones
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

    // Guardar el PDF
    pdf.save("cv.pdf")
  } finally {
    document.body.removeChild(element)
  }
}
