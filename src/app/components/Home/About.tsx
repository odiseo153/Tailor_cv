"use client"

import { motion } from "framer-motion"
import { FileText, Zap, Target, Award, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function About() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const features = [
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Currículums Personalizados",
      description:
        "Genera currículums a medida que se ajustan a los requisitos específicos del trabajo, aumentando tus posibilidades de ser notado.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Análisis con IA",
      description:
        "Nuestra IA avanzada analiza las descripciones de los trabajos para identificar las habilidades y cualificaciones clave que buscan los empleadores.",
    },
    {
      icon: <Target className="h-10 w-10 text-primary" />,
      title: "Proceso Optimizado",
      description: "Ahorra tiempo y esfuerzo automatizando el proceso de personalización del currículum para cada solicitud.",
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "Mayor Tasa de Éxito",
      description:
        "Destaca entre otros candidatos con un currículum que se alinea perfectamente con lo que buscan los reclutadores.",
    },
  ]

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
          <p className="text-lg mb-6">
            TailorCV fue creado con un objetivo simple: optimizar el proceso de solicitud de empleo y aumentar tus
            posibilidades de conseguir entrevistas. Entendemos que solicitar empleos puede llevar mucho tiempo y ser
            frustrante, especialmente cuando envías el mismo currículum a docenas de puestos diferentes.
          </p>
          <p className="text-lg">
            Nuestra plataforma aprovecha el poder de la Inteligencia Artificial para analizar las descripciones de los
            trabajos y adaptar automáticamente el contenido de tu currículum, asegurando una mejor coincidencia con los
            requisitos específicos de cada puesto.
          </p>
        </div>
        <div className="relative rounded-lg overflow-hidden shadow-xl">
          <img
            src="https://static.vecteezy.com/system/resources/previews/033/999/389/non_2x/resume-icon-personal-data-check-icon-icon-for-web-design-isolated-on-white-background-vector.jpg"
            alt="Interfaz de la plataforma TailorCV"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="bg-background/90 p-4 rounded-lg">
              <p className="font-medium text-lg">Personalización de Currículums con IA</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.7, delay: 0.4 }}>
        <h2 className="text-3xl font-bold text-center mb-12">Cómo Funciona TailorCV</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="mt-20 text-center"
      >
      </motion.div>
    </div>
  )
}
