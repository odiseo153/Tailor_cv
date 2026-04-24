"use client";

import { useState, Suspense, lazy, useRef, useEffect } from "react";
import { generatePdfViaBrowser } from "@/lib/puppeteer-pdf/client";
import { generateWord } from "./htmlToWord";
import { optimizeHtmlForExport, validateHtmlForExport } from "./ExportManager";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Editor } from "./EditView";
import dynamic from "next/dynamic";

// Importaciones dinámicas para mejorar el rendimiento
const CodeEditor = lazy(() => import("./CodeEditor"));
// Importamos CanvaEditor solo cuando se active la pestaña, no al inicio
const CanvaEditor = dynamic(() => import("./CanvaEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500 p-10">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600">Inicializando editor avanzado...</p>
        <p className="text-sm text-gray-500 mt-2">
          Por favor espere, esto puede tardar unos segundos
        </p>
      </div>
    </div>
  ),
});

// Importacion del nuevo CanvasEditor
const CanvasEditor = dynamic(() => import("./CustomCanvas/CanvasEditor"), {
  ssr: false,
  loading: () => (
    <div className="text-center p-4">Cargando modo interactivo...</div>
  ),
});

const A4_PAGE_WIDTH = "210mm";
const A4_PAGE_HEIGHT = "297mm";

function addPreviewPageStyles(html: string, pageIndex: number) {
  const pageStyle = `
    <style>
      @page {
        size: ${A4_PAGE_WIDTH} ${A4_PAGE_HEIGHT};
        margin: 0;
      }

      html {
        width: ${A4_PAGE_WIDTH};
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      .tailor-cv-page-content {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        padding: 10mm;
        box-sizing: border-box;
        overflow-wrap: break-word;
        transform: translateY(calc(-${A4_PAGE_HEIGHT} * ${pageIndex}));
        transform-origin: top left;
      }

      :where(body:not([style]) .tailor-cv-page-content) {
        color: #111827;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 10.5pt;
        line-height: 1.42;
      }

      :where(h1, h2, h3, p, ul, ol) {
        margin-top: 0;
      }

      :where(h1) {
        font-size: 18pt;
        line-height: 1.1;
        margin-bottom: 4mm;
      }

      :where(h2) {
        border-bottom: 1px solid #d1d5db;
        font-size: 13pt;
        margin: 6mm 0 3mm;
        padding-bottom: 1.5mm;
      }

      :where(h3) {
        font-size: 11pt;
        margin: 4mm 0 1mm;
      }

      :where(p) {
        margin-bottom: 2mm;
      }

      :where(ul, ol) {
        padding-left: 5mm;
        margin-bottom: 3mm;
      }

      :where(li) {
        margin-bottom: 1.5mm;
      }
    </style>
  `;

  const htmlWithStyles = /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${pageStyle}</head>`)
    : `<!DOCTYPE html><html><head>${pageStyle}</head><body>${html}</body></html>`;

  if (/<body[^>]*>/i.test(htmlWithStyles)) {
    return htmlWithStyles
      .replace(/<body([^>]*)>/i, "<body$1><div class=\"tailor-cv-page-content\">")
      .replace(/<\/body>/i, "</div></body>");
  }

  return htmlWithStyles;
}

interface HtmlEditorProps {
  initialHtml: string;
}

export default function HtmlEditor({ initialHtml }: HtmlEditorProps) {
  const [html, setHtml] = useState(initialHtml);
  const [activeTab, setActiveTab] = useState("preview");
  const [downloadType, setDownloadType] = useState("pdf");
  const [css, setCss] = useState("");
  const [loadCanvaEditor, setLoadCanvaEditor] = useState(false);
  const [previewPageCount, setPreviewPageCount] = useState(1);

  const handleHtmlChange = (newHtml: string) => setHtml(newHtml);

  const handleCanvaEditorSave = (newHtml: string, newCss: string) => {
    setHtml(newHtml);
    setCss(newCss);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Solo cargar el editor Canva cuando el usuario selecciona esa pestaña
    if (value === "canva") {
      setLoadCanvaEditor(true);
    }
  };

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreviewPageCount(1);
  }, [html, css]);

  const updatePreviewPageCount = (iframe: HTMLIFrameElement) => {
    const documentNode = iframe.contentDocument;

    if (!documentNode) return;

    const contentHeight = Math.max(
      documentNode.documentElement.scrollHeight,
      documentNode.body?.scrollHeight ?? 0,
    );
    const pageHeight =
      iframe.clientHeight || documentNode.documentElement.clientHeight;

    if (!contentHeight || !pageHeight) return;

    setPreviewPageCount(Math.max(1, Math.ceil(contentHeight / pageHeight)));
  };

  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
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
      `;

      // Validate HTML before export
      const validation = validateHtmlForExport(fullHtml);
      if (!validation.valid) {
        setValidationIssues(validation.issues);
        setIsDownloading(false);
        return;
      }

      // Optimize HTML for better export quality
      const optimizedHtml = optimizeHtmlForExport(fullHtml);

      if (downloadType === "pdf") {
        const pdfBlob = await generatePdfViaBrowser(optimizedHtml);
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cv.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (downloadType === "word") {
        await generateWord(optimizedHtml, {
          filename: "cv.docx",
        });
      }
    } catch (error) {
      console.error("Error downloading:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl rounded-3xl overflow-hidden">
      <CardContent className="p-8 sm:p-12 flex flex-col gap-3 h-full">
        {/* Controles superiores: Selección de pestañas y opciones de descarga */}
        <div className="flex  sm:flex-row items-center justify-between gap-4 border-b border-gray-300 pb-4">
          <div className=" w-full">
            <div className="">
              <select
                title="Seleccionar pestaña"
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="preview">Preview</option>
                <option value="canva">Editor Visual (Legacy)</option>
                <option value="interactive">Canvas Style (Beta)</option>
                <option value="code">Code Editor</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <>
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
                disabled={isDownloading}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 animate-bounce" />
                )}
              </Button>
            </>
          </div>
        </div>

        {/* Validation Issues */}
        {validationIssues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="text-red-800 font-semibold">
                Export Validation Issues
              </h4>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {validationIssues.map((issue, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {issue}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => setValidationIssues([])}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Dismiss
            </Button>
          </div>
        )}

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
            <TabsContent value="code" className="h-full">
              <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border border-gray-200">
                <CodeEditor htmlView={html} onChange={handleHtmlChange} />
              </div>
            </TabsContent>

            <TabsContent value="canva" className="h-full">
              <div className="h-full w-full rounded-lg overflow-hidden shadow-inner border border-gray-200 bg-white">
                {loadCanvaEditor && (
                  <CanvaEditor html={html} onSave={handleCanvaEditorSave} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="interactive" className="h-full">
              <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-gray-50">
                <CanvasEditor initialHtml={html} />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="h-full">
              <div
                ref={previewRef}
                className="h-full w-full rounded-lg overflow-auto border border-gray-200 shadow-inner bg-gray-100"
              >
                <div className="flex flex-col items-center gap-8 p-6">
                  {Array.from({ length: previewPageCount }).map(
                    (_, pageIndex) => (
                      <div key={pageIndex} className="bg-white shadow-xl">
                        <iframe
                          srcDoc={addPreviewPageStyles(
                            `
                    <html>
                      <head>
                        <style>${css}</style>
                      </head>
                      <body>${html}</body>
                    </html>
                  `,
                            pageIndex,
                          )}
                          className="bg-white"
                          onLoad={(event) => {
                            if (pageIndex === 0) {
                              updatePreviewPageCount(event.currentTarget);
                            }
                          }}
                          scrolling="no"
                          style={{
                            width: A4_PAGE_WIDTH,
                            height: A4_PAGE_HEIGHT,
                            border: "none",
                          }}
                          title={`Vista previa del HTML - Pagina ${pageIndex + 1}`}
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Suspense>
      </CardContent>
    </Card>
  );
}
