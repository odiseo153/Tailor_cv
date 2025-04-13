"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CVModal from "./CVModal"
import CVPreview from "./CVPreview"
import { Message } from "@/app/utils/Message"
import { useAppContext } from "@/app/context/AppContext"

interface CVTemplate {
  id: number
  name: string
  html: string
  image: string
  author: string
}

export default function CVGallery() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedCV, setSelectedCV] = useState<CVTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState<File | null>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const { setTemplate } = useAppContext()

  // Cargar templates desde la API
  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) =>
        setTemplates(
          data.pdfFiles.map((file: any, index: number) => ({
            id: index,
            name: file.name,
            html: "", // Si tienes HTML asociado, agrégalo aquí
            image: file.pngUrl || file.pdfUrl, // Prioriza PNG, fallback a PDF
            author: "Odiseo", // Ajusta según tus datos
          }))
        )
      )
      .catch((e) => console.error("Error fetching templates:", e))
  }, [])

  const toggleExpand = () => setIsExpanded(!isExpanded)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewTemplate(file)
      const reader = new FileReader()
      reader.onloadend = () => setPdfPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const submitTemplate = async () => {
    if (!newTemplate) return Message.errorMessage("Selecciona un archivo primero.")

    const formData = new FormData()
    formData.append("template", newTemplate)

    try {
      const response = await fetch("/api/templates", { method: "POST", body: formData })
      const { pngUrl, pdfUrl } = await response.json()
      Message.successMessage("Template subido y convertido a PNG con éxito")
      setTemplates((prev) => [
        ...prev,
        { id: prev.length, name: newTemplate.name, html: "", image: pngUrl || pdfUrl, author: "Odiseo" },
      ])
      setNewTemplate(null)
      setPdfPreviewUrl(null)
    } catch (e) {
      Message.errorMessage("Error al subir el template.")
    }
  }

  const changeTemplate = (template: CVTemplate) => {
    setTemplate(template.html)
    setSelectedCV(template)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full p-4 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <button onClick={toggleExpand} className="flex items-center gap-2 text-xl font-bold text-gray-800">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          Plantillas de CV <span className="text-gray-500">({templates.length})</span>
        </button>
      </div>

      {isExpanded && (
        <>
          <p className="text-sm text-gray-600 mb-4">Hecho por Odiseo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="flex flex-col items-center justify-center p-4 h-[280px] bg-white rounded-lg hover:shadow-xl transition-shadow">
              <label htmlFor="upload-template" className="cursor-pointer">
                <input
                placeholder="."
                  id="upload-template"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
              </label>
              <p className="mt-2 text-sm text-gray-700">{newTemplate?.name || "Subir PDF"}</p>
              {pdfPreviewUrl && (
                <img src={pdfPreviewUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
              )}
              <Button
                onClick={submitTemplate}
                className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg"
              >
                Subir
              </Button>
            </Card>

            {templates.map((template) => (
              <motion.div key={template.id} whileHover={{ scale: 1.05 }} className="relative group">
                <input
                placeholder="."
                  type="radio"
                  name="selected-template"
                  checked={selectedCV?.id === template.id}
                  onChange={() => changeTemplate(template)}
                  className="absolute top-2 left-2 z-10"
                />
                <CVPreview template={template} onClick={() => setSelectedCV(template)} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {selectedCV && <CVModal template={selectedCV} onClose={() => setSelectedCV(null)} />}
    </motion.div>
  )
}