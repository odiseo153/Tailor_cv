"use client"

import { motion } from "framer-motion"
import { FileText, Zap, Target, Award } from "lucide-react"
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
    <div className="container mx-auto px-4 py-16 max-w-6xl bg-gradient-to-b from-gray-50 to-white">
      {/* Sección de Título */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
        className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
      >
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Nuestra Misión</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            TailorCV fue creado con un objetivo simple: optimizar el proceso de solicitud de empleo y aumentar tus
            posibilidades de conseguir entrevistas.
          </p>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
          <img
            src="https://static.vecteezy.com/system/resources/previews/033/999/389/non_2x/resume-icon-personal-data-check-icon-icon-for-web-design-isolated-on-white-background-vector.jpg"
            alt="Interfaz de la plataforma TailorCV"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </motion.div>

      {/* Sección de Características */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Cómo Funciona TailorCV</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardHover}
              whileHover="hover"
              className="h-full"
            >
              <Card className="border-none shadow-lg bg-white rounded-xl overflow-hidden h-full">
                <CardContent className="pt-6 px-5 pb-5 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="mb-4 p-3 bg-blue-100 rounded-full"
                  >
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Botón Call-to-Action */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.6 }}
        className="text-center mt-16"
      >
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all">
          Prueba TailorCV Ahora
        </Button>
      </motion.div>
    </div>
  )
}