"use client"

import { useState, Suspense, lazy, useRef } from "react"
import { generatePdf } from "./htmlToPdf"
import { generateWord } from "./htmlToWord"
import { Download, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Editor } from "./EditView"
import dynamic from "next/dynamic"

// Importaciones dinámicas para mejorar el rendimiento
const CodeEditor = lazy(() => import("./CodeEditor"))
// Importamos CanvaEditor solo cuando se active la pestaña, no al inicio
const CanvaEditor = dynamic(() => import("./CanvaEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500 p-10">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600">Inicializando editor avanzado...</p>
        <p className="text-sm text-gray-500 mt-2">Por favor espere, esto puede tardar unos segundos</p>
      </div>
    </div>
  )
})

interface HtmlEditorProps {
  initialHtml: string
}

export default function HtmlEditor({ initialHtml }: HtmlEditorProps) {
  const [html, setHtml] = useState(initialHtml)
  const [activeTab, setActiveTab] = useState("preview")
  const [downloadType, setDownloadType] = useState("pdf")
  const [css, setCss] = useState("")
  const [loadCanvaEditor, setLoadCanvaEditor] = useState(false)

  const handleHtmlChange = (newHtml: string) => setHtml(newHtml)

  const handleCanvaEditorSave = (newHtml: string, newCss: string) => {
    setHtml(newHtml)
    setCss(newCss)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Solo cargar el editor Canva cuando el usuario selecciona esa pestaña
    if (value === "canva") {
      setLoadCanvaEditor(true)
    }
  }

  const previewRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    // Crear un documento completo con HTML y CSS
    const fullHtml = `
      <html>
        <head>
          <style>
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `

    if (downloadType === "pdf") {
      generatePdf(fullHtml)
    } else if (downloadType === "word") {
      generateWord(fullHtml)
    }
  }

  return (
    <Card className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl rounded-3xl overflow-hidden">
      <CardContent className="p-8 sm:p-12 flex flex-col gap-3 h-full">
        {/* Controles superiores: Selección de pestañas y opciones de descarga */}
        <div className="flex  sm:flex-row items-center justify-between gap-4 border-b border-gray-300 pb-4">
          <div className=" w-full">
            {/* Tabs para pantallas grandes */}
           {/*
            <div className="flex-col hidden sm:block">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="  bg-gray-200 p-1 rounded-full">
                  <TabsTrigger
                    value="preview"
                    className="px-5 py-2 text-sm sm:text-base rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="canva"
                    className="px-5 py-2 text-sm sm:text-base rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Editor Canva
                  </TabsTrigger>
                  <TabsTrigger
                    value="editor"
                    className="px-5 py-2 text-sm sm:text-base rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Editor Básico
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="px-5 py-2 text-sm sm:text-base rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Code Editor
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
                */}
            {/* Select para pantallas pequeñas que lista todas las pestañas */}
            <div className="">
              <select
                title="Seleccionar pestaña"
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="preview">Preview</option>
             {/*
                <option value="editor">Editor Básico</option>
                 <option value="canva">Editor Canva</option>
              */}
                <option value="code">Code Editor</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              aria-label="Seleccionar tipo de descarga"
              value={downloadType}
              onChange={(e) => setDownloadType(e.target.value)}
              className="px-4 py-2 text-sm sm:text-base bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
            </select>
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300"
            >
              <Download className="w-5 h-5 animate-bounce" />
            </Button>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando editor...</span>
            </div>
          }
        >
          <Tabs value={activeTab} className="flex-grow">
            <TabsContent value="canva" className="h-full">
              <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border border-gray-200">
                {loadCanvaEditor ? (
                  <CanvaEditor html={html} onSave={handleCanvaEditorSave} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-10 text-center">
                    <p className="text-gray-500 mb-4">
                      El editor avanzado se cargará al seleccionar esta pestaña
                    </p>
                    <Button
                      onClick={() => setLoadCanvaEditor(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
                    >
                      Cargar Editor Canva
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="editor" className="h-full">
              <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border border-gray-200">
                <Editor html={html} />
              </div>
            </TabsContent>

            <TabsContent value="code" className="h-full">
              <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border border-gray-200">
                <CodeEditor htmlView={html} onChange={handleHtmlChange} />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="h-full">
              <div ref={previewRef} className="h-full w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-white">
                <iframe
                  srcDoc={`
                    <html>
                      <head>
                        <style>${css}</style>
                      </head>
                      <body>${html}</body>
                    </html>
                  `}
                  className="w-full h-[850px]"
                  title="Vista previa del HTML"
                />
              </div>
            </TabsContent>
          </Tabs>
        </Suspense>
      </CardContent>
    </Card>
  )
}
