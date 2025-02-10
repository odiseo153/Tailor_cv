"use client"

import { useState, Suspense, lazy, useEffect } from "react"
import { generatePdf } from "./htmlToPdf"
import { Download } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"


const VisualEditor = lazy(() => import("./VisualEditor"))
const CodeEditor = lazy(() => import("./CodeEditor"))

interface HtmlEditorProps {
  initialHtml: string
}

export default function HtmlEditor({ initialHtml }: HtmlEditorProps) {
  const [html, setHtml] = useState(initialHtml)
  const [activeTab, setActiveTab] = useState("preview")

  useEffect(() => {
    // Cargar Tailwind CSS
    const script = document.createElement('script')
    script.src = 'https://cdn.tailwindcss.com'
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleHtmlChange = (newHtml: string) => {
    setHtml(newHtml)
  }

  const handleDownloadPdf = () => {
    generatePdf(html)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex justify-between items-center border-b">
            <div className="flex-1">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="visual">Visual Editor</TabsTrigger>
              <TabsTrigger value="code">Code Editor</TabsTrigger>
            </div>
            <Button onClick={handleDownloadPdf} className="flex items-center h-10">
              <Download className="mr-2" />
            </Button>
          </TabsList>
          <Suspense fallback={<div>Loading editor...</div>}>
            <TabsContent value="visual" className="mt-4">
              <VisualEditor html={html} onChange={handleHtmlChange} />
            </TabsContent>
            <TabsContent value="code" className="mt-4 w-full ">
              <CodeEditor htmlView={html} onChange={handleHtmlChange} />
            </TabsContent>
            <TabsContent value="preview" className="mt-4 max-w-none">
              <div className="border rounded-md p-4  h-[600px] overflow-auto"> {/* Ajuste de altura con h-[600px] */}
                <iframe 
                  srcDoc={`
                        ${html}
                      
                  `}
                  className="w-full h-full"
                />
              </div>
            </TabsContent>
          </Suspense>
        </Tabs>
      </CardContent>
    </Card>
  )
}

{/* Componentes de Shadcn/ui usados: Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Button */}
