"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CVGallery from "../components/Templates/CVGallery";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export default function TemplatesPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [templateHtml, setTemplateHtml] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: string;
  };

  const isValidHtml =
    templateHtml.trim() === "" || /<[a-z][\s\S]*>/i.test(templateHtml);

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateHtml || !isValidHtml) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          templateHtml,
          authorId: session?.user.id,
        }),
      });
      if (res.ok) {
        setOpen(false);
        setName("");
        setTemplateHtml("");
        window.location.reload();
      } else {
        alert("Error al agregar la plantilla");
      }
    } catch (error) {
      console.error(error);
      alert("Error al agregar la plantilla");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Explora Plantillas de CV
          </h1>
          <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            Elige entre nuestras plantillas personalizables para destacar en tu
            próxima solicitud de empleo.
          </p>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="px-8 shadow-md hover:shadow-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Agregar plantilla
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] flex flex-col p-6">
              <form
                onSubmit={handleAddTemplate}
                className="flex flex-col h-full overflow-hidden"
              >
                <DialogHeader className="shrink-0">
                  <DialogTitle className="text-2xl">
                    Crear Nueva Plantilla
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 flex-1 overflow-hidden">
                  {/* Formulario */}
                  <div className="flex flex-col gap-4 h-full overflow-hidden">
                    <div className="flex flex-col gap-2 shrink-0">
                      <Label htmlFor="name">Nombre de la plantilla</Label>
                      <Input
                        id="name"
                        placeholder="Ej. Desarrollador Frontend"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                      <Label htmlFor="html">Código HTML</Label>
                      <Textarea
                        id="html"
                        placeholder="Pega el código HTML de tu plantilla aquí..."
                        value={templateHtml}
                        onChange={(e) => setTemplateHtml(e.target.value)}
                        required
                        className={`flex-1 resize-none font-mono text-sm ${
                          !isValidHtml && templateHtml.length > 0
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      {!isValidHtml && templateHtml.length > 0 && (
                        <p className="text-sm text-red-500 font-medium shrink-0">
                          Por favor, ingresa un código HTML válido.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vista Previa */}
                  <div className="flex flex-col gap-2  overflow-hidden">
                    <Label>Vista Previa</Label>
                    <div className="flex-1 relative  bg-gray-100 border border-gray-300 rounded-md">
                      {templateHtml.trim() && isValidHtml ? (
                        <iframe
                          srcDoc={templateHtml}
                          title="Preview"
                          className="absolute top-0 left-0 border-0 bg-white"
                          style={{
                            width: "200%",
                            height: "200%",
                            transform: "scale(0.5)",
                            transformOrigin: "top left",
                            pointerEvents: "none",
                          }}
                          sandbox="allow-same-origin allow-scripts"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-6 text-center min-h-[400px]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mb-3 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p>La vista previa aparecerá aquí</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-4 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || !name || !templateHtml || !isValidHtml
                    }
                  >
                    {isSubmitting ? "Guardando..." : "Guardar plantilla"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <CVGallery />
      </section>
    </main>
  );
}
