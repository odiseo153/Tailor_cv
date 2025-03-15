"use client";

import { useState } from "react";
import {  UploadIcon, TextIcon, ImageIcon, Eye, FileMinus  } from "lucide-react";
import ShowHtml from "../components/Edit_html/Index";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Message } from "../utils/Message";
import { CVHandler } from "../Handler/CVHandler";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import { useSession } from "next-auth/react";


export default function GenerarCV() {
  const [ofertaLaboral, setOfertaLaboral] = useState<File | string | null>(null);
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null);
  const [foto, setFoto] = useState<string | undefined>();
  const [informacion, setInformacion] = useState("");
  const [data, setData] = useState<{ html: string } | null>(null);
  const [ofertaType, setOfertaType] = useState<'pdf' | 'image' | 'text'>("text");
  const [isLoading, setIsLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");

  const cv_handler = new CVHandler();
  const {template} = useAppContext();
  const { data: session } = useSession();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    const start = Date.now();

    //console.log(template);

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const estimatedTotal = (elapsed / (progress + 1)) * 100;
      const remaining = estimatedTotal - elapsed;
      
      setTimeLeft(formatTime(remaining));
      if (progress < 90) setProgress(prev => Math.min(prev + 10, 90));
    }, 1000);

    setOfertaLaboral(null);
    setPlantillaCV(null);
    setFoto(undefined);
    setInformacion("");
    setData(null);
    setProgress(0);
    setTimeLeft("");

    try {
      const responseHtml = await cv_handler.crearCV(ofertaLaboral, ofertaType, plantillaCV ?? template, informacion,foto);
      clearInterval(interval);
      
      if (responseHtml) {
        setProgress(100);
        setTimeLeft("Listo!");
        setTimeout(() => setIsLoading(false), 500);
        setData(responseHtml);
        Message.successMessage("CV Generado Exitosamente");
      }
    } catch (error) {
      clearInterval(interval);
      setIsLoading(false);
      Message.errorMessage("Error al generar CV");
    } 
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds <= 0) return "Listo!";
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s restantes`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setPlantillaCV(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewTemplate(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewTemplate(null);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photo = event.target?.result as string;
        console.log(photo);
        setFoto(photo);
      };
      reader.readAsDataURL(file);
    } else {
      setFoto(undefined);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-12">
          Genera tu <span className="text-blue-600">CV Personalizado</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <form onSubmit={handleSubmit} className="space-y-8 w-full lg:w-2/4 bg-white p-6 rounded-2xl shadow-xl">
            
            {/* Secciones del formulario... 
            <Link
              href="/templates"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <FileMinus size={18} className="mr-2" />
              Buscar una plantilla
            </Link>
            */}

       <Card className="border-none shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Oferta Laboral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <Button
                    type="button"
                    variant={ofertaType === "pdf" ? "default" : "outline"}
                    onClick={() => setOfertaType("pdf")}
                    title="Subir PDF"
                  >
                    <UploadIcon size={18} className="mr-2" />
                    PDF
                  </Button>
                  <Button
                    type="button"
                    variant={ofertaType === "image" ? "default" : "outline"}
                    onClick={() => setOfertaType("image")}
                    title="Subir imagen"
                  >
                    <ImageIcon size={18} className="mr-2" />
                    Imagen
                  </Button>
                  <Button
                    type="button"
                    variant={ofertaType === "text" ? "default" : "outline"}
                    onClick={() => setOfertaType("text")}
                    title="Texto"
                  >
                    <TextIcon size={18} className="mr-2" />
                    Texto
                  </Button>
                </div>
                {ofertaType === "pdf" || ofertaType === "image" ? (
                  <div className="grid w-full max-w-xs items-center gap-1.5">
                    <label htmlFor="picture" className="text-bold text-gray-800 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{ofertaType === "pdf" ? "Plantilla en pdf" : "imagen"}</label>
                    <Input
                     type="file"
                     required
                     accept={ofertaType === "pdf" ? ".pdf" : "image/*"}
                     className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium"
                     id="picture"
                    />
                  </div>
                ) : (
                  <Textarea
                    rows={5}
                    required
                    value={ofertaLaboral as string ?? ""}
                    onChange={(e) => setOfertaLaboral(e.target.value)}
                    placeholder="Pega aquí el texto de la oferta laboral..."
                  />
                )}
              </CardContent>
            </Card>

            {/* FOTO
            
            <Card className="border-none shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Subir Foto Para el CV (opcional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input type="file" accept=".png, .jpg, .jpeg" onChange={handleFotoChange} />
                {foto && (
                  <div className="mt-4 flex justify-center">
                    <Avatar className="w-24 h-24 border shadow-md">
                      <AvatarImage
                        src={foto as string}
                        alt="Vista previa"
                        className="object-cover"
                      />
                    </Avatar>
                  </div>
                )}
              </CardContent>
            </Card>
            */}

            {/* PLANTILLA */}
            <Card className="border-none shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Subir Plantilla (opcional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input type="file" accept=".pdf" onChange={handleFileChange} />
                {previewTemplate && (
                  <div className="flex justify-end mt-4">
                    <Dialog>
                      <DialogTrigger>
                        <Eye className="text-gray-500 hover:text-gray-700" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Vista previa de la plantilla</DialogTitle>
                        </DialogHeader>
                        <iframe
                          src={previewTemplate}
                          className="w-full h-96"
                          title="Vista previa"
                        />

                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* INFORMACIÓN EXTRA */}
            <Card className="border-none shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Información Adicional (opcional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={5}
                  value={informacion}
                  onChange={(e) => setInformacion(e.target.value)}
                  placeholder="Añade información que creas que pueda ayudar a tu CV"
                />
              </CardContent>
            </Card>

            {isLoading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{progress}%</span>
                  <span>{timeLeft}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"/>
                  <span>Generando CV...</span>
                </div>
              ) : "Generar CV"}
            </Button>
          </form>

          {data && (
            <div className="w-full lg:w-2/4 bg-white p-6 rounded-2xl shadow-xl">
              <ShowHtml html={data.html} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}