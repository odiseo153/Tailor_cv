"use client"

import { useState, Suspense, lazy, useEffect, useRef } from "react"
import { generatePdf } from "./htmlToPdf"
import { Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Message } from "@/app/utils/Message"
import jsPDF from "jspdf"
import html2canvas from 'html2canvas';
import { Editor } from "./EditView"

const CodeEditor = lazy(() => import("./CodeEditor"))

interface HtmlEditorProps {
  initialHtml: string
}

export default function HtmlEditor({ initialHtml }: HtmlEditorProps) {
  const [html, setHtml] = useState(initialHtml)
  const [activeTab, setActiveTab] = useState("preview")

  /*
  useEffect(() => {
    const script = document.createElement('script');
    const link = document.createElement('link');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
    document.head.appendChild(script)
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(script)
      document.head.removeChild(link)
    }
  }, [])
  */

  const handleHtmlChange = (newHtml: string) => setHtml(newHtml)

  const previewRef = useRef<HTMLDivElement>(null);
  const handleDownloadPdf = async () => {
    generatePdf(html)
}

  return (
    <Card className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl rounded-3xl">
      <CardContent className="p-6 sm:p-10 flex flex-col gap-6">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Tabs onValueChange={setActiveTab}>

            <TabsList className="flex gap-2 bg-gray-200 p-1 rounded-full">
              <TabsTrigger
                value="preview"
                className="px-5 py-2 text-sm sm:text-base rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md transition"
              >
                Preview
              </TabsTrigger>
             {/*
              <TabsTrigger
                value="editor"
                className="px-5 py-2 text-sm sm:text-base rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md transition"
              >
                Editor
              </TabsTrigger>
              */}
              <TabsTrigger
                value="code"
                className="px-5 py-2 text-sm sm:text-base rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md transition"
              >
                Code Editor
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
          >
            <Download className="w-5 h-5 animate-bounce" />
            <span className="font-semibold tracking-wide">Download PDF</span>
          </Button>
        
          

        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full flex flex-col gap-4"
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-gray-500">
                Cargando editor...
              </div>
            }
          >
            <TabsContent value="editor" className="flex-grow">
              <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border">
                <Editor html={html} />
              </div>
            </TabsContent>

            <TabsContent value="code" className="flex-grow">
              <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border">
                <CodeEditor htmlView={html} onChange={handleHtmlChange} />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-grow">
              <div  ref={previewRef} className="h-full w-full rounded-lg overflow-hidden border shadow-inner bg-white">
                <iframe
                  
                  srcDoc={html}
                  className="w-full h-[850px]"
                  title="HTML Preview"
                />
              </div>
            </TabsContent> 
          </Suspense>
        </Tabs>


      </CardContent>
    </Card>
  )
}
