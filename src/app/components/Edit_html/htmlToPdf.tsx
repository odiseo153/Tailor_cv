import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export const generatePdf = async (html: string) => {
  const element = document.createElement("div")
  element.innerHTML = html
  element.style.width = "800px"
  document.body.appendChild(element)

  try {
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF()
    pdf.addImage(imgData, "PNG", 0, 0, 210, (canvas.height * 210) / canvas.width)
    pdf.save("cv.pdf")
  } finally {
    document.body.removeChild(element)
  }
}

