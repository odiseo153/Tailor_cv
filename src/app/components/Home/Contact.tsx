'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilePlus, MessageCircle, CheckCircle2,Shield } from "lucide-react"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Message } from "@/app/utils/Message"

export default function ContactSection() {
  const router = useRouter();
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    message: '',
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.email || !formData.industry || !formData.message) {
      Message.errorMessage('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Error al enviar el mensaje: ${response.status}`);
      }

      console.log(data);

      Message.successMessage('Mensaje enviado correctamente!');
      setFormData({ name: '', email: '', industry: '', message: '' });
    } catch (error) {
      console.error(error);
      alert('Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.');
    }
  };


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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <Input id="name" name="name" placeholder="Juan Pérez" onChange={handleChange} value={formData.name} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Dirección de Email
                  </label>
                  <Input id="email" name="email" type="email" placeholder="juan@example.com" onChange={handleChange} value={formData.email} />
                </div>
              </div>

              <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Dinos tu industria
                  </label>
                  <Input id="industry" name="industry" type="text" placeholder="Desarrollo de software" onChange={handleChange} value={formData.industry} />
                </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Tu Mensaje
                </label>
                <Textarea id="message" name="message" placeholder="Cuéntanos cómo podemos ayudarte..." rows={4} onChange={handleChange} value={formData.message} />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Enviar Mensaje</Button>
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

              <blockquote className="text-lg text-gray-700 italic mb-4">
                "TailorCV me ayudó a obtener entrevistas en empresas tecnológicas de primer nivel después de meses de silencio. El AI me emparejó perfectamente con los requisitos del trabajo."
              </blockquote>

              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <p className="font-medium text-gray-900">Markus Johnson</p>
                  <p className="text-sm text-gray-600">Desarrollador De Software Junior</p>
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
