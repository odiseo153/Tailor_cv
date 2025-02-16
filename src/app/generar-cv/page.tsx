"use client";

import { useState } from "react";
import { FileIcon, UploadIcon, TextIcon, ImageIcon } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ShowHtml from "../components/Edit_html/Index";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Message } from "../utils/Message";

export default function GenerarCV() {
  const [ofertaLaboral, setOfertaLaboral] = useState<File | string | null>(null);
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null);
  const [informacion, setInformacion] = useState("");
  const [data, setData] = useState<{ html: string}>();
  const [ofertaType, setOfertaType] = useState<'pdf' | 'image' | 'text'>("text");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('ofertaType', ofertaType);
    if (ofertaLaboral) {
      formData.append('ofertaLaboral', ofertaLaboral);
    }

    if (plantillaCV) {
      formData.append('plantillaCV', plantillaCV);
    }
    formData.append('informacionAdicional', informacion);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text(); // Read response.text() once
      if (response.ok) {
        try {
          const result = JSON.parse(responseText); // Try to parse JSON
          setData(result);
          Message.successMessage("CV Generado Exitosamente:");
        } catch (jsonError) {
          console.error("Error al parsear JSON en respuesta exitosa:", jsonError);
          console.error("Respuesta del servidor (texto):", responseText);
          Message.errorMessage("Error al procesar la respuesta del servidor. Detalles en la consola.");
        }
      } else {
        try {
          const errorResult = JSON.parse(responseText); // Try to parse JSON for error
          Message.errorMessage(`Error al generar CV: ${errorResult.error || 'Error desconocido'}`);
          console.error("Error al generar CV:", errorResult);
        } catch (jsonError) {
          console.error("Error al parsear JSON en respuesta de error:", jsonError);
          console.error("Respuesta del servidor (texto):", responseText);
          Message.errorMessage("Error del servidor al generar CV. Detalles en la consola.");
        }
      }
    } catch (error) {
      console.error("Error de red o al procesar la respuesta:", error);
      Message.errorMessage("Error al generar CV. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
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
                    value={ofertaLaboral as string}
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
                <CardTitle>Plantilla de CV (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input type="file" accept=".pdf" title="Plantilla CV" onChange={(e) => setPlantillaCV(e.target.files?.[0] || null)} className="block w-full border p-2 rounded" />
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
      <Footer />
    </div>
  );
}
