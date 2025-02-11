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
    <Card className="w-full min-h-screen sm:min-h-[600px] lg:min-h-[800px]">
      <CardContent className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="flex flex-col sm:flex-row justify-between items-center border-b space-y-2 sm:space-y-0 w-full">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <TabsTrigger 
                value="preview" 
                className="text-sm sm:text-base px-4 py-2"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger 
                value="code" 
                className="text-sm sm:text-base px-4 py-2"
              >
                Code Editor
              </TabsTrigger>
            </div>
            <Button 
              onClick={handleDownloadPdf} 
              className="flex items-center h-8 sm:h-10 w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </TabsList>

          <div className="flex-grow mt-8">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-sm sm:text-base">Loading editor...</div>
              </div>
            }>
              <TabsContent 
                value="code" 
                className="h-full"
              >
                <div className="h-[calc(100vh-200px)] sm:h-[500px] lg:h-[700px] w-full">
                  <CodeEditor htmlView={html} onChange={handleHtmlChange} />
                </div>
              </TabsContent>

              <TabsContent 
                value="preview" 
                className="h-full"
              >
                <div className="border rounded-md p-2 sm:p-4 h-[calc(100vh-200px)] sm:h-[500px] lg:h-[700px] w-full overflow-auto">
                  <iframe
                    srcDoc={html}
                    className="w-full h-full"
                    title="Preview"
                  />
                </div>
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}