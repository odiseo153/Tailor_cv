"use client";

import { ChangeEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

import CVGallery from "../components/Templates/CVGallery";
import { buildTemplatePreviewSrcDoc } from "@/lib/template-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TemplatesPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [templateHtml, setTemplateHtml] = useState("");
  const [selectedHtmlFileName, setSelectedHtmlFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession() as {
    data: Session | null;
    status: string;
  };

  const isValidHtml =
    templateHtml.trim() === "" || /<[a-z][\s\S]*>/i.test(templateHtml);

  const resetForm = () => {
    setName("");
    setTemplateHtml("");
    setSelectedHtmlFileName("");
  };

  const handleHtmlFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedHtmlFileName("");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".html")) {
      alert("Solo se permiten archivos .html");
      e.target.value = "";
      setSelectedHtmlFileName("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const html = typeof reader.result === "string" ? reader.result : "";
      setTemplateHtml(html);
      setSelectedHtmlFileName(file.name);
    };
    reader.onerror = () => {
      alert("No se pudo leer el archivo HTML");
      setSelectedHtmlFileName("");
    };
    reader.readAsText(file, "utf-8");
  };

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

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Error al agregar la plantilla");
      }

      setOpen(false);
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al agregar la plantilla",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-center">
          <h1 className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-center text-4xl font-bold text-transparent">
            Explora Plantillas de CV
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-gray-600">
            Elige entre nuestras plantillas personalizables para destacar en tu
            proxima solicitud de empleo.
          </p>

          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="px-8 shadow-md transition-all hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
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
            <DialogContent className="flex h-[95vh] w-[95vw] max-w-[95vw] flex-col p-6">
              <form
                onSubmit={handleAddTemplate}
                className="flex h-full flex-col overflow-hidden"
              >
                <DialogHeader className="shrink-0">
                  <DialogTitle className="text-2xl">
                    Crear Nueva Plantilla
                  </DialogTitle>
                </DialogHeader>
                <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden py-4 md:grid-cols-2">
                  <div className="flex h-full flex-col gap-4 overflow-hidden">
                    <div className="flex flex-col gap-2 shrink-0">
                      <Label htmlFor="name">Nombre de la plantilla</Label>
                      <Input
                        id="name"
                        placeholder="Ej. Contabilidad Minimalista"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Label htmlFor="html-file">Archivo HTML</Label>
                      <Input
                        id="html-file"
                        type="file"
                        accept=".html,text/html"
                        onChange={handleHtmlFileChange}
                      />
                      {selectedHtmlFileName && (
                        <p className="text-sm text-gray-500">
                          Archivo cargado: {selectedHtmlFileName}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
                      <Label htmlFor="html">HTML detectado</Label>
                      <Textarea
                        id="html"
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
                        <p className="shrink-0 text-sm font-medium text-red-500">
                          Por favor, ingresa un codigo HTML valido.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 overflow-hidden">
                    <Label>Vista Previa</Label>
                    <div className="relative flex-1 rounded-md border border-gray-300 bg-gray-100">
                      {templateHtml.trim() && isValidHtml ? (
                        <iframe
                          srcDoc={buildTemplatePreviewSrcDoc(templateHtml)}
                          title="Preview"
                          className="absolute left-0 top-0 border-0 bg-white"
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
                        <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center bg-gray-50 p-6 text-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mb-3 h-12 w-12 text-gray-300"
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
                          <p>La vista previa aparecera aqui.</p>
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
