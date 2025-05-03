"use client"

import { motion } from "framer-motion"
import { FileText, Zap, Target, Award, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: FileText,
    title: "Currículums Personalizados",
    description:
      "Genera currículums a medida que se ajustan a los requisitos específicos del trabajo, aumentando tus posibilidades de ser notado.",
  },
  {
    icon: Zap,
    title: "Análisis con IA",
    description:
      "Nuestra IA avanzada analiza las descripciones de los trabajos para identificar las habilidades y cualificaciones clave que buscan los empleadores.",
  },
  {
    icon: Target,
    title: "Proceso Optimizado",
    description: "Ahorra tiempo y esfuerzo automatizando el proceso de personalización del currículum para cada solicitud.",
  },
  {
    icon: Award,
    title: "Mayor Tasa de Éxito",
    description:
      "Destaca entre otros candidatos con un currículum que se alinea perfectamente con lo que buscan los reclutadores.",
  },
]

// Variantes de animación
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const cardHover = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
}

export default function About() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl bg-gradient-to-b from-gray-50 via-white to-blue-50">
      {/* Sección de Título */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center mb-20"
      >
        <div className="inline-block mb-4 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          Descubre TailorCV
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ¿Qué es TailorCV?
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          La plataforma inteligente que te ayuda a crear currículums personalizados para cada solicitud de empleo.
        </p>
      </motion.div>

      {/* Sección de Misión */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-center"
      >
        <div className="flex flex-col justify-center order-2 md:order-1">
          <div className="inline-block mb-4 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            Nuestra razón de ser
          </div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Nuestra Misión</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            TailorCV fue creado con un objetivo simple: optimizar el proceso de solicitud de empleo y aumentar significativamente tus
            posibilidades de conseguir entrevistas.
          </p>
          <ul className="space-y-4 mb-8">
            {[
              "Simplificar la creación de CV personalizados",
              "Maximizar tus oportunidades laborales",
              "Ahorrar tiempo valioso en tu búsqueda"
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="mr-3 mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
    
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 order-1 md:order-2">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl filter blur-sm opacity-50"></div>
          <img
            src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            alt="Interfaz de la plataforma TailorCV"
            className="w-full h-full object-cover rounded-xl relative"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
        </div>
      </motion.div>

      {/* Sección de Características */}
      <div className="mb-24">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Características principales
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Por qué elegir TailorCV</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nuestras características están diseñadas para optimizar tu búsqueda de empleo
          </p>
        </motion.div>
          
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <Card 
              key={i}
              className="border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 * i }}
                whileHover="hover"
                variants={cardHover}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </motion.div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sección de Estadísticas */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="rounded-2xl p-10 mb-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 rounded-2xl"></div>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Resultados comprobados
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">TailorCV en Números</h2>
            <p className="text-lg text-gray-600">Estadísticas que demuestran nuestro impacto</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5,000+", label: "Usuarios Activos" },
              { value: "85%", label: "Tasa de Entrevistas" },
              { value: "10x", label: "Ahorro de Tiempo" },
              { value: "24/7", label: "Soporte Disponible" }
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center group">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</span>
                <span className="text-gray-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Final */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center py-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-4 text-white">¿Listo para impulsar tu carrera?</h2>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
          Comienza a crear currículums optimizados y aumenta tus posibilidades de conseguir entrevistas.
        </p>
        <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          Crear mi CV ahora
        </Button>
      </motion.div>
    </div>
  )
}