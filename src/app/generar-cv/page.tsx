"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { UploadIcon, TextIcon, ImageIcon, Eye } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {  Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ShowHtml from "../components/Edit_html/Index"
import CVSkeleton from "../components/Edit_html/CV_Skeleton"
import { CVHandler } from "../Handler/CVHandler"
import { Message } from "../utils/Message"
import { useAppContext } from "../context/AppContext"

export default function GenerarCV() {
  const [ofertaLaboral, setOfertaLaboral] = useState<string>("Backend Developer...")
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null)
  const [foto] = useState<string | undefined>()
  const [informacion, setInformacion] = useState("")
  const [data, setData] = useState<{ html: string } | null>(null)
  const [ofertaType, setOfertaType] = useState<"pdf" | "image" | "text">("text")
  const [isLoading, setIsLoading] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  const { template } = useAppContext()
  const cvHandler = new CVHandler()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const responseHtml = await cvHandler.crearCV(ofertaLaboral, ofertaType, plantillaCV ?? template, informacion, foto)
      setData(responseHtml)
      Message.successMessage("CV Generado Exitosamente")
    } catch {
      Message.errorMessage("Error al generar CV")
    } finally {
      setIsLoading(false)
      setOfertaLaboral("")
      setPlantillaCV(null)
      setInformacion("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void, setPreview?: (preview: string | null) => void) => {
    const file = e.target.files?.[0] || null
    setFile(file)
    if (file && setPreview) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else setPreview?.(null)
  }

  const fadeIn = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container max-w-5xl flex flex-col lg:flex-row gap-8"
      >
        <form onSubmit={handleSubmit} className="lg:w-1/2 space-y-6 p-6 bg-white rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Crea tu <span className="text-blue-600">CV Personalizado</span>
          </h1>

          {/* Oferta Laboral */}
          <Card className="border-none bg-gray-50 rounded-xl">
            <CardHeader className="pb-2"><h2 className="text-lg font-semibold">Oferta Laboral</h2></CardHeader>
            <CardContent className="space-y-4">
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
                    onClick={() => setOfertaType(type as any)}
                    className="flex-1"
                  >
                    <Icon size={16} className="mr-1" /> {label}
                  </Button>
                ))}
              </div>
              {ofertaType === "text" ? (
                <Textarea
                  value={ofertaLaboral}
                  onChange={(e) => setOfertaLaboral(e.target.value)}
                  placeholder="Pega la oferta laboral..."
                  className="h-32"
                  required
                />
              ) : (
                <Input
                  type="file"
                  accept={ofertaType === "pdf" ? ".pdf" : "image/*"}
                  onChange={(e) => handleFileChange(e, setOfertaLaboral as any)}
                  className="bg-white"
                  required
                />
              )}
            </CardContent>
          </Card>

          {/* Plantilla */}
          <Card className="border-none bg-gray-50 rounded-xl">
            <CardHeader className="pb-2"><h2 className="text-lg font-semibold">Plantilla (Opcional)</h2></CardHeader>
            <CardContent>
              <Input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setPlantillaCV, setPreviewTemplate)} className="bg-white" />
              {previewTemplate && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="mt-2"><Eye size={20} /></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Vista Previa</DialogTitle></DialogHeader>
                    <iframe src={previewTemplate} className="w-full h-80" />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Textarea
            value={informacion}
            onChange={(e) => setInformacion(e.target.value)}
            placeholder="Información adicional (opcional)"
            className="h-24 bg-gray-50 rounded-xl"
          />

          {/* Botón Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Generando...
              </span>
            ) : "Generar CV"}
          </Button>
        </form>

        {/* Vista Previa */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="lg:w-1/2 p-6 bg-white rounded-2xl shadow-lg"
        >
          {isLoading && !data ? <CVSkeleton /> : data && <ShowHtml html={data.html} />}
        </motion.div>
      </motion.main>
    </div>
  )
}