"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { UploadIcon, TextIcon, ImageIcon, Eye, BriefcaseIcon, Check } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ShowHtml from "../components/Edit_html/Index"
import CVSkeleton from "../components/Edit_html/CV_Skeleton"
import { CVHandler, ProgressCallback } from "../Handler/CVHandler"
import { Message } from "../utils/Message"
import { useAppContext, useStore } from "../context/AppContext"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"


export default function GenerarCV() {
  const [ofertaLaboral, setOfertaLaboral] = useState<string | File>("") // Allow string or File
  const [carrera, setCarrera] = useState<string>("") // Allow string or File
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null)
  const [informacion, setInformacion] = useState("")
  const [data, setData] = useState<{ html: string } | null>(null)
  const [ofertaType, setOfertaType] = useState<"pdf" | "image" | "text">("text")
  const [isLoading, setIsLoading] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("")

  // API tracking states
  const [infoApiDone, setInfoApiDone] = useState(false)
  const [templateApiDone, setTemplateApiDone] = useState(false)
  const [apiProgress, setApiProgress] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  const { template } = useAppContext()
  const { templateId } = useStore()
  const cvHandler = new CVHandler()

  // Cargar la plantilla seleccionada cuando se carga la página
 /*
 useEffect(() => {
  const fetchSelectedTemplate = async () => {
    if (templateId) {
        try {
          const response = await fetch("/api/templates");
          if (response.ok) {
            const data = await response.json();
            const selectedTemplate = data.pdfFiles.find(
              (template: any) => template.id.toString() === templateId
            );

            if (selectedTemplate) {
              setSelectedTemplateName(selectedTemplate.name);
              // No cargamos el archivo automáticamente, solo guardamos la información
            }
          }
        } catch (error) {
          console.error("Error al cargar la plantilla seleccionada:", error);
        }
      }
    };

    fetchSelectedTemplate();
  }, [templateId]);
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setData(null); // Clear previous data when submitting

    // Reset API tracking states
    setInfoApiDone(false);
    setTemplateApiDone(false);
    setApiProgress(0);
    startTimeRef.current = Date.now();

    try {
      // Basic validation
      if (ofertaType === 'text' && typeof ofertaLaboral !== 'string' || (typeof ofertaLaboral === 'string' && !ofertaLaboral.trim())) {
        Message.errorMessage("Por favor, ingresa la oferta laboral en texto.");
        setIsLoading(false);
        return;
      }
      if (ofertaType !== 'text' && typeof ofertaLaboral === 'string') { // ofertaLaboral should be a File object if not text
        Message.errorMessage("Por favor, selecciona un archivo para la oferta laboral.");
        setIsLoading(false);
        return;
      }

      // Progress callback for tracking API status
      const progressCallback: ProgressCallback = {
        onInfoProcessed: () => setInfoApiDone(true),
        onTemplateProcessed: () => setTemplateApiDone(true),
        onProgress: (progress) => setApiProgress(progress)
      };

      // Pasar el templateId solo si no hay un plantillaCV cargado
      const templateIdToUse = !plantillaCV && templateId ? templateId : undefined;

      // Create the CV with progress tracking
      const responseHtml = await cvHandler.crearCV(
        ofertaLaboral,
        ofertaType,
        plantillaCV ?? template,
        informacion,
        carrera,
        undefined, // foto
        templateIdToUse,
        progressCallback
      );

      setData(responseHtml)
      Message.successMessage("CV Generado Exitosamente")
    } catch (error: any) {
      console.error("Error generating CV:", error);
      Message.errorMessage("Error al generar CV: " + (error.message || "Error desconocido"));
    } finally {
      setIsLoading(false)
      // Optionally clear inputs after success, but maybe keep them for regeneration?
      // setOfertaLaboral("")
      // setPlantillaCV(null)
      // setInformacion("")
      // setPreviewTemplate(null); // Clear template preview if inputs are cleared
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void, setPreview?: (preview: string | null) => void) => {
    const file = e.target.files?.[0] || null
    setFile(file)
    if (file && setPreview) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview?.(null);
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <div className="min-h-screen   p-4 sm:p-6 lg:p-8">
      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8 py-8"
      >

        {/* Formulario - Left Column */}
        <motion.form
          onSubmit={handleSubmit}
          variants={fadeIn}
          className="lg:col-span-2 p-6 sm:p-8 bg-white border-2 rounded-2xl shadow-xl space-y-6 h-fit" // h-fit to prevent stretching
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
            Crea tu <span className="text-blue-600">CV Personalizado</span>
          </h1>

          {/* Oferta Laboral */}

          <Separator />

          {/* Plantilla */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-700">Carrera a la que perteneces</h2>
              {/* You can choose a different icon if Briefcase is not suitable */}
              <BriefcaseIcon className="w-5 h-5 text-gray-500" />
            </div>
            <Input
              type="text"
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              placeholder="Ej. Ingeniería de Software, Marketing Digital, etc."
              className="bg-gray-50 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">1. Oferta Laboral</h2>

            <div className="flex gap-2">
              {[
                { type: "pdf", icon: UploadIcon, label: "PDF" },
                { type: "image", icon: ImageIcon, label: "Imagen" },
                { type: "text", icon: TextIcon, label: "Texto" },
              ].map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  type="button"
                  variant={ofertaType === type ? "default" : "outline"}
                  onClick={() => {
                    setOfertaType(type as any);
                    setOfertaLaboral(""); // Clear input when changing type
                  }}
                  className="flex-1 flex items-center justify-center gap-2 text-sm sm:text-base rounded-full transition-all duration-300"
                >
                  <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>
            {ofertaType === "text" ? (
              <Textarea
                value={ofertaLaboral as string} // Cast to string for Textarea
                onChange={(e) => setOfertaLaboral(e.target.value)}
                placeholder="Pega la oferta laboral aquí (texto)..."
                className="h-32 bg-gray-50 rounded-xl border-gray-200 focus:ring-blue-500"
                required
              />
            ) : (
              <Input
                type="file"
                accept={ofertaType === "pdf" ? ".pdf" : "image/*"}
                onChange={(e) => handleFileChange(e, setOfertaLaboral as any)} // Cast to any for File type
                className="bg-gray-50 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            )}
          </div>

          <Separator />

          {/* Plantilla */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">2. Plantilla (Opcional)</h2>

{/*
            {templateId && (
              <div className="flex items-center p-2 bg-green-50 rounded-lg border border-green-200 mb-2">
                <Check className="text-green-500 mr-2 h-5 w-5" />
                <span className="text-sm text-green-700 font-medium">
                  Usando plantilla: <span className="font-bold">{selectedTemplateName}</span>
                </span>
                <Link href="/templates" className="ml-auto text-blue-600 text-sm hover:underline">
                  Cambiar
                </Link>
              </div>
            )}

*/}

            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, setPlantillaCV, setPreviewTemplate)}
              className="bg-gray-50 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />


            {previewTemplate && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="mt-2 text-blue-600 hover:text-blue-800 flex items-center gap-2">
                    <Eye size={20} /> Vista Previa de Plantilla
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Vista Previa de la Plantilla</DialogTitle>
                  </DialogHeader>
                  <iframe src={previewTemplate} className="w-full h-96 rounded-lg border" />
                </DialogContent>
              </Dialog>
            )}
            {!plantillaCV && !templateId && template && ( // Indicate which template is being used if none is uploaded
              <p className="text-sm text-gray-500 mt-2">Usando plantilla por defecto.</p>
            )}
            {plantillaCV && templateId && (
              <p className="text-sm text-amber-500 mt-2">La plantilla cargada manualmente sobrescribirá la plantilla seleccionada.</p>
            )}
          </div>

          <Separator />

          {/* Información Adicional */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">3. Información Adicional (Opcional)</h2>
            <Textarea
              value={informacion}
              onChange={(e) => setInformacion(e.target.value)}
              placeholder="Habilidades clave, logros específicos, experiencia relevante no cubierta en la oferta, etc."
              className="h-24 bg-gray-50 rounded-xl border-gray-200 focus:ring-blue-500"
            />
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            disabled={isLoading || (ofertaType === 'text' && !ofertaLaboral) || (ofertaType !== 'text' && !ofertaLaboral)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Generando...
              </span>
            ) : (
              "Generar CV"
            )}
          </Button>
        </motion.form>

        {/* Vista Previa - Right Column */}
        <motion.div
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 p-3 border-2 bg-white rounded-2xl shadow-xl flex flex-col" // Use flex-col for content alignment
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Vista Previa del CV</h2>
          <div className="flex-grow rounded-lg overflow-hidden  bg-gray-50"> {/* Added bg-gray-50 */}
            {isLoading ? (
              <CVSkeleton
                progress={apiProgress}
                isFirstApiDone={infoApiDone}
                isSecondApiDone={templateApiDone}
              />
            ) : data ? (
              <ShowHtml html={data.html} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                <ImageIcon size={48} className="mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Tu CV aparecerá aquí</p>
                <p className="text-sm">Completa el formulario de la izquierda y haz clic en "Generar CV" para ver la vista previa.</p>
              </div>
            )}
          </div>
        </motion.div>

      </motion.main>
    </div>
  )
}