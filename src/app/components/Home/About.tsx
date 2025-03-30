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

export default function About() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Que es TailorCV</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          La plataforma inteligente que te ayuda a crear currículums personalizados para cada solicitud de empleo
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
      >
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">Nuestra Misión</h2>
          <p className="text-lg">
            TailorCV fue creado con un objetivo simple: optimizar el proceso de solicitud de empleo y aumentar tus
            posibilidades de conseguir entrevistas.
          </p>
        </div>
        <div className="relative rounded-lg overflow-hidden shadow-xl">
          <img
            src="https://static.vecteezy.com/system/resources/previews/033/999/389/non_2x/resume-icon-personal-data-check-icon-icon-for-web-design-isolated-on-white-background-vector.jpg"
            alt="Interfaz de la plataforma TailorCV"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.7, delay: 0.4 }}>
        <h2 className="text-3xl font-bold text-center mb-12">Cómo Funciona TailorCV</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
