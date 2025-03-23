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
import { useAppContext } from "../context/AppContext";
import { useSession } from "next-auth/react";
import CVSkeleton from "../components/Edit_html/CV_Skeleton";
import HtmlToWord from "../components/Edit_html/HtmlToWord";


export default function GenerarCV() {
  const [ofertaLaboral, setOfertaLaboral] = useState<File | string | null>(`
    We are looking for a Backend Software Developer with expertise in Django, Python, SQLite, and PostgreSQL to design and develop scalable backend systems for cross-platform applications (Linux, macOS, Windows). The ideal candidate will also have experience working with backend packages, firmware development, CI/CD pipelines, and AWS services. Strong problem-solving skills, attention to detail, and excellent communication abilities are essential for success in this role.

Key Responsibilities:

 • Design, develop, and maintain backend applications using Django and Python.

 • Build and optimize database structures using SQLite and PostgreSQL.

 • Develop and integrate cross-platform backend solutions compatible with Linux, macOS, and Windows.

 • Collaborate with frontend developers to provide efficient APIs and data services.

 • Implement CI/CD pipelines to streamline deployment and testing processes.

 • Work with AWS services to enhance scalability, security, and performance.

 • Maintain and optimize backend infrastructure, ensuring reliability and efficiency.

 • Debug and troubleshoot backend issues, ensuring high performance and security.

 • Develop and support firmware integration within backend applications.

 • Stay updated with emerging backend technologies, best practices, and security measures.

 • Clearly communicate technical concepts and solutions to team members and stakeholders.

Required Qualifications:

 • 3+ years of professional experience in backend development.

 • Proficiency in Django, Python, SQLite, and PostgreSQL.

 • Experience with cross-platform development (Linux, macOS, Windows).

 • Strong understanding of backend packages and modern development tools.

 • Familiarity with firmware integration and low-level backend operations.

 • Hands-on experience with CI/CD tools (GitHub Actions, GitLab CI, Jenkins, etc.).

 • Knowledge of AWS services relevant to backend development.

 • Strong debugging, problem-solving, and performance optimization skills.

 • Excellent communication and collaboration skills.

Preferred Qualifications:

 • Experience with RESTful APIs, GraphQL, WebSockets, and real-time data handling.

 • Knowledge of Docker, Kubernetes, and containerized deployments.

 • Understanding of asynchronous programming in Python.

 • Familiarity with unit testing and integration testing frameworks (PyTest, Unittest, etc.).

 • Experience in Agile development environments.

`);
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null);
  const [foto, setFoto] = useState<string | undefined>();
  const [informacion, setInformacion] = useState("");
  const [data, setData] = useState<{ html: string } | null>(null);
  const [ofertaType, setOfertaType] = useState<'pdf' | 'image' | 'text'>("text");
  const [isLoading, setIsLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const cv_handler = new CVHandler();
  const {template} = useAppContext();
  const { data: session } = useSession();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setOfertaLaboral(null);
    setPlantillaCV(null);
    setFoto(undefined);
    setInformacion("");
    setData(null);

    try {
      const responseHtml = await cv_handler.crearCV(ofertaLaboral, ofertaType, plantillaCV ?? template, informacion,foto);
      
      if (responseHtml) {
        setIsLoading(false);
        setData(responseHtml);
        Message.successMessage("CV Generado Exitosamente");
      }
    } catch (error) {
      setIsLoading(false);
      Message.errorMessage("Error al generar CV");
    } 
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

            <HtmlToWord 
        initialHtml={`
          <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV Francisco Andrade</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex justify-center py-10">
    <div class="bg-white w-4/5 max-w-2xl shadow-lg p-8">
        <header class="border-l-4 border-black pl-4 mb-6">
            <h1 class="text-3xl font-bold">FRANCISCO <span class="block">ANDRADE</span></h1>
            <p class="text-gray-600 uppercase tracking-wide text-sm">Programador Web</p>
        </header>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Perfil</h2>
            <p class="text-gray-700 text-sm">Me recibí de Diseñador Web en el año 2020 y estoy en busca de un nuevo trabajo. Actualmente estoy cursando en el área de Marketing, especializado en redes sociales. Me considero una persona responsable y creativa.</p>
        </section>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Idiomas</h2>
            <p class="text-sm text-gray-700">Inglés: <span class="font-semibold">Avanzado</span></p>
            <p class="text-sm text-gray-700">Alemán: <span class="font-semibold">Intermedio</span></p>
        </section>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Educación</h2>
            <p class="text-sm text-gray-700"><span class="font-semibold">Licenciatura en Diseño Web</span> - Universidad de Córdoba (2018-2020)</p>
            <p class="text-sm text-gray-700 mt-2"><span class="font-semibold">Escuela Secundaria</span> - Colegio San Andrés (2010-2016)</p>
        </section>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Experiencia</h2>
            <div class="mb-4">
                <p class="font-semibold">Asistente de Gerencia</p>
                <p class="text-sm text-gray-700">Seguros de Agencia. Revisión de balances de documentos y control de facturación.</p>
            </div>
            <div class="mb-4">
                <p class="font-semibold">Pasante Administrativo</p>
                <p class="text-sm text-gray-700">Recepción en Clínicas. Organización de bases de datos y salas.</p>
            </div>
            <div>
                <p class="font-semibold">Atención al Público</p>
                <p class="text-sm text-gray-700">Mención en Clínicas personales. Asistencia y seguimiento de stock.</p>
            </div>
        </section>
        
        <section>
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Contacto</h2>
            <p class="text-sm text-gray-700"><span class="font-semibold">Dirección:</span> Calle Odugarse 125, Córdoba</p>
            <p class="text-sm text-gray-700"><span class="font-semibold">Teléfono:</span> (954) 123-4567</p>
            <p class="text-sm text-gray-700"><span class="font-semibold">Email:</span> hola@hotashotmail.com</p>
        </section>
    </div>
</body>
</html>

          `}
      />
           

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

          <div className="w-full lg:w-2/4 bg-white p-6 rounded-2xl shadow-xl">
          {data && (
              <ShowHtml html={data.html} />
            )}

            {isLoading && !data && (
              <CVSkeleton />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}