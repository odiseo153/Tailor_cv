'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FilePlus, MessageCircle, CheckCircle2, Shield, Send, Mail, Phone, MapPin } from "lucide-react"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Message } from "@/app/utils/Message"
import { motion } from "framer-motion"

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
      Message.errorMessage('Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-3 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Estamos aquí para ti
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Contáctanos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte a conseguir el trabajo que mereces.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Información de contacto */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-xl h-full flex flex-col justify-between">
              <div>
                <motion.h3 variants={itemVariants} className="text-2xl font-bold mb-6">Hablemos</motion.h3>
                <motion.p variants={itemVariants} className="text-blue-100 mb-10">
                  Estamos comprometidos a ayudarte a destacar en el mercado laboral actual. Si tienes cualquier duda, sugerencia o consulta, no dudes en contactarnos.
                </motion.p>

                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-blue-200 mt-1 mr-4" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-blue-100">soporte@tailorcv.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="w-6 h-6 text-blue-200 mt-1 mr-4" />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-blue-100">+34 91 123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-blue-200 mt-1 mr-4" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-blue-100">Madrid, España</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Horario y redes sociales */}
              <motion.div variants={itemVariants} className="mt-12 pt-6 border-t border-blue-500/30">
                <p className="font-medium mb-2">Horario de atención</p>
                <p className="text-blue-100 mb-4">Lunes a Viernes: 9:00 - 18:00</p>
                
                <div className="flex space-x-4 mt-4">
                  {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <span className="sr-only">{social}</span>
                      <div className="w-5 h-5 text-white"></div>
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Formulario de contacto */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Envíanos un mensaje</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                      Nombre Completo <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Juan Pérez" 
                      onChange={handleChange} 
                      value={formData.name} 
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      Email <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="juan@example.com" 
                      onChange={handleChange} 
                      value={formData.email} 
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium text-gray-700 flex items-center">
                    Tu industria <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input 
                    id="industry" 
                    name="industry" 
                    type="text" 
                    placeholder="Ej. Desarrollo de software" 
                    onChange={handleChange} 
                    value={formData.industry} 
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center">
                    Mensaje <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="¿Cómo podemos ayudarte?" 
                    rows={4} 
                    onChange={handleChange} 
                    value={formData.message} 
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar Mensaje</span>
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <span className="text-sm text-gray-600">Tus datos están protegidos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-600">GDPR Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Testimonio destacado */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center"
        >
          <div className="mb-6">
            <div className="inline-block rounded-full overflow-hidden border-4 border-white shadow-lg w-20 h-20 mb-4">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Testimonio de cliente" className="w-full h-full object-cover" />
            </div>
            <blockquote className="text-xl text-gray-700 italic mb-4">
              "TailorCV me ayudó a obtener entrevistas en empresas tecnológicas de primer nivel después de meses de silencio. El AI personalizó perfectamente mi perfil para cada oferta."
            </blockquote>
            <div className="flex flex-col items-center">
              <p className="font-semibold text-gray-900">Markus Johnson</p>
              <p className="text-sm text-blue-600">Desarrollador Full-stack</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-yellow-400">★</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
