"use client";

import { useState, useEffect } from "react";
import { FileIcon, UploadIcon, TextIcon, ImageIcon } from "lucide-react";
import ShowHtml from "../components/Edit_html/Index";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Message } from "../utils/Message";
import { CVHandler } from "../Handler/CVHandler";



export default function GenerarCV() {
  const [ofertaLaboral, setOfertaLaboral] = useState<File | string | null>(null);
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null);
  const [informacion, setInformacion] = useState("");
  const [data, setData] = useState<{ html: string}>();
  const [ofertaType, setOfertaType] = useState<'pdf' | 'image' | 'text'>("text");
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<string[]>(['']);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<string | null>(null);
  const cv_handler = new CVHandler();



  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const request = await fetch("/api/templates");
        const response = await request.json();

        console.log(response.contentHtml);
        setTemplates(response.contentHtml); // Actualiza con el contenido HTML
      } catch (error) {
        console.error("Error cargando las plantillas:", error);
      }
    };

    loadTemplates();
  }, []); 

  const handleTemplateClick = async (template: string) => {
    setSelectedTemplate(template);
    try {
      setSelectedTemplateContent(template);
    } catch (error) {
      console.error("Error fetching template content:", error);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const responseHtml = await cv_handler.crearCV(
      ofertaLaboral,
      ofertaType,
      undefined,
      informacion
    );

    if (responseHtml) {
      setData(responseHtml);
      Message.successMessage("CV Generado Exitosamente:");
    } else {
      Message.errorMessage("Error al procesar la respuesta del servidor. Detalles en la consola.");
    }
  } catch (error) {
    console.error("Error al generar CV:", error);
    Message.errorMessage("Error al generar CV. Por favor, intenta nuevamente.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-6 py-12 ">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Genera tu CV Personalizado</h1>
        <div className="flex flex-col lg:flex-row gap-8"> {/* Changed to flex-col on small screens and flex-row on larger screens */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full lg:w-2/4"> {/* Form takes full width on small screens and 2/4 on larger */}
            {/* Sección Oferta Laboral */}
            <Card>
              <CardHeader>
                <CardTitle>Oferta Laboral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    variant={ofertaType === "pdf" ? "default" : "secondary"}
                    onClick={() => setOfertaType("pdf")}
                    title="Subir PDF"
                  >
                    <UploadIcon size={18} className="mr-2" />
                  </Button>
                  <Button
                    type="button"
                    variant={ofertaType === "image" ? "default" : "secondary"}
                    onClick={() => setOfertaType("image")}
                    title="Subir imagen"
                  >
                    <ImageIcon size={18} className="mr-2" />
                  </Button>
                  <Button
                    type="button"
                    variant={ofertaType === "text" ? "default" : "secondary"}
                    onClick={() => setOfertaType("text")}
                    title="Texto"
                  >
                    <TextIcon size={18} className="mr-2" />
                  </Button>
                </div>
                {ofertaType === "pdf" || ofertaType === "image" ? (
                  <Input
                    type="file"
                    title="po"
                    accept={ofertaType === "pdf" ? ".pdf" : "image/*"}
                    onChange={(e) => setOfertaLaboral(e.target.files?.[0] || null)}
                    className="block w-full border p-2 rounded"
                  />
                ) : (
                  <Textarea
                    rows={4}
                    value={ofertaLaboral as string ?? ""}
                    onChange={(e) => setOfertaLaboral(e.target.value)}
                    className="block w-full border p-2 rounded"
                    placeholder="Pega aquí el texto de la oferta laboral..."
                  />
                )}
              </CardContent>
            </Card>

            {/* Sección Plantilla de CV 
            <Card>
              <CardHeader>
                <CardTitle>Plantillas de CV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div key={template} className={`p-4 border rounded cursor-pointer ${selectedTemplate === template ? 'border-blue-500' : 'border-gray-300'}`} onClick={() => handleTemplateClick(template)}>
                      <iframe
                        srcDoc={template}
                        className="w-full h-full"
                        title="Preview"
                        style={{ zoom: '1.0', transform: 'scale(1)', transformOrigin: '0 0' }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
              */}

            {/* Sección Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea rows={4} value={informacion} onChange={(e) => setInformacion(e.target.value)} className="block w-full border p-2 rounded" placeholder="Añade información que creas que pueda ayudar a tu CV" />
              </CardContent>
            </Card>

            {/* Botón de envío */}
            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
              {isLoading ? "Generando CV..." : "Generar CV"}
            </Button>
          </form>
          {data &&
            <div className="w-full mt-8" > {/* Added mt-8 to create space between form and ShowHtml */}
              <ShowHtml html={data?.html ?? ""} />
            </div>
          }
        </div>
      </main>
      {/*
      {selectedTemplateContent && (
        <Dialog open={!!selectedTemplateContent} onOpenChange={() => setSelectedTemplateContent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vista Previa de la Plantilla</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedTemplateContent }} />
            </div>
          </DialogContent>
        </Dialog>
      )}
              */}
    </div>
  );
}
