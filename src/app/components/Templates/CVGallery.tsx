"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Plus, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CVModal from "./CVModal"
import CVPreview from "./CVPreview"
import { Message } from "@/app/utils/Message"
import { useStore } from "@/app/context/AppContext"

interface CVTemplate {
  id: number | string
  name: string
  pdfUrl: string
  pngUrl?: string
  author: string
}

export default function CVGallery() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedCV, setSelectedCV] = useState<CVTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState<File | null>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { templateId, setTemplateId } = useStore()

  const fetchTemplates = () => {
    setIsLoading(true)
    setError(null)
    fetch("/api/templates")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (!data || !Array.isArray(data.pdfFiles)) {
          throw new Error("Invalid API response structure")
        }
        setTemplates(
          data.pdfFiles.map((file: any, index: number) => ({
            id: file.id ?? index,
            name: file.name || `Template ${index + 1}`,
            pdfUrl: file.pdfUrl,
            pngUrl: file.pngUrl,
            author: file.author || "Odiseo",
          }))
        )
      })
      .catch((e) => {
        console.error("Error fetching templates:", e)
        setError(`Failed to load templates: ${e.message}`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchTemplates()
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to upload: ${response.statusText}`)
      }
      const newTemplateData = await response.json()
      Message.successMessage("Template subido con éxito")
      setTemplates((prev) => [
        ...prev,
        {
          id: newTemplateData.id,
          name: newTemplateData.name || newTemplate.name,
          pdfUrl: newTemplateData.pdfUrl,
          pngUrl: newTemplateData.pngUrl,
          author: newTemplateData.author || "Odiseo",
        }
      ])
      setNewTemplate(null)
      setPdfPreviewUrl(null)
    } catch (e: any) {
      console.error("Error uploading template:", e)
      Message.errorMessage(`Error al subir el template: ${e.message}`)
    }
  }

  const handleDeleteTemplate = async (templateToDelete: CVTemplate) => {
    if (!confirm(`¿Estás seguro de eliminar la plantilla "${templateToDelete.name}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/templates?filename=${templateToDelete.name}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) {
        throw new Error(`Error al eliminar: ${response.statusText}`);
      }
      
      // Si es el template seleccionado, borrarlo del almacenamiento
      if (templateToDelete.id.toString() === templateId) {
        setTemplateId('');
      }
      
      // Si estaba seleccionado en el modal, cerrar el modal
      if (selectedCV?.id === templateToDelete.id) {
        setSelectedCV(null);
      }
      
      // Eliminar de la lista local
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      
      Message.successMessage(`Plantilla "${templateToDelete.name}" eliminada`);
    } catch (error: any) {
      console.error("Error eliminando template:", error);
      Message.errorMessage(`Error al eliminar: ${error.message}`);
    }
  }

  const handleSelectTemplate = (template: CVTemplate) => {
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
          {isLoading && <p className="text-center text-gray-500 py-4">Cargando plantillas...</p>}
          {error && <p className="text-center text-red-500 py-4">{error}</p>}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <Card className="flex flex-col items-center justify-between p-4 h-[280px] bg-white rounded-lg border border-dashed border-gray-300 hover:border-blue-500 transition-colors group">
                <label htmlFor="upload-template" className="flex flex-col items-center justify-center text-center cursor-pointer flex-grow">
                  <input
                    id="upload-template"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {pdfPreviewUrl ? (
                    <img src={pdfPreviewUrl} alt="Preview Upload" className="mb-2 w-full h-32 object-contain rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center mb-2 transition-colors">
                      <Plus className="w-8 h-8 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                  )}
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-blue-700 transition-colors break-words w-full px-2">
                    {newTemplate?.name || "Subir PDF"}
                  </p>
                </label>
                <Button
                  onClick={submitTemplate}
                  disabled={!newTemplate}
                  size="sm"
                  className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg disabled:opacity-50"
                >
                  Subir
                </Button>
              </Card>

              {templates.map((template) => (
                <CVPreview
                  key={template.id}
                  template={template}
                  onClick={() => handleSelectTemplate(template)}
                  isSelected={selectedCV?.id === template.id}
                  onDelete={() => handleDeleteTemplate(template)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedCV && <CVModal template={selectedCV} onClose={() => setSelectedCV(null)} />}
    </motion.div>
  )
}