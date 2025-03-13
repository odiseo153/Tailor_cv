'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilePlus, MessageCircle, CheckCircle2,Shield } from "lucide-react"

export default function ContactSection() {
  const industries = [
    "Tecnología",
    "Finanzas",
    "Salud",
    "Educación",
    "Marketing",
    "Manufactura",
    "Comercio",
    "Hospitalidad",
    "Construcción",
    "Legal",
    "Medios",
    "Sin fines de lucro",
    "Gobierno",
    "Transporte",
    "Energía",
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Contáctanos</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">¿Tienes preguntas? Estamos aquí para ayudarte a triunfar.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Formulario de contacto */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Envíanos un mensaje</h3>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <Input id="name" placeholder="Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Dirección de Email
                  </label>
                  <Input id="email" type="email" placeholder="juan@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium text-gray-700">
                  Industria
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu industria" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Adjunta tu oferta laboral (Opcional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input type="file" className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <FilePlus className="h-6 w-6 text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Arrastra y suelta tu archivo aquí, o <span className="text-blue-600 font-medium">busca</span>
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOCX o TXT (Máx 5MB)</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Tu Mensaje
                </label>
                <Textarea id="message" placeholder="Cuéntanos cómo podemos ayudarte..." rows={4} />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">Enviar Mensaje</Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Necesitas ayuda inmediata? Prueba nuestro chatbot en la esquina inferior derecha.</span>
              </div>
            </div>
          </div>

          {/* Testimonio */}
          <div className="flex flex-col justify-center">
            <div className="bg-gray-50 rounded-xl p-8 shadow-lg border border-gray-100 mb-8">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">0:30</div>
                </div>
              </div>

              <blockquote className="text-lg text-gray-700 italic mb-4">
                "TailorCV me ayudó a obtener entrevistas en empresas tecnológicas de primer nivel después de meses de silencio. El AI me emparejó perfectamente con los requisitos del trabajo."
              </blockquote>

              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <p className="font-medium text-gray-900">Sara Johnson</p>
                  <p className="text-sm text-gray-600">Ingeniero de Software en Google</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-6 w-6 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Encriptación SSL</p>
                  <p className="text-sm text-gray-600">Tu datos están siempre seguros</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Cumplimos con el GDPR</p>
                  <p className="text-sm text-gray-600">Respetamos tu privacidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
