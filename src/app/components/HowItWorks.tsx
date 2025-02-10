"use client";

import { motion } from "framer-motion"
import { Upload, Edit, Download } from "lucide-react"
import { Card } from "@/components/ui/card"

const steps = [
  {
    icon: <Upload className="w-12 h-12 text-blue-500" />,
    title: "Sube tu oferta laboral",
    description: "Carga el PDF o texto de la oferta de trabajo que te interesa.",
  },
  {
    icon: <Edit className="w-12 h-12 text-blue-500" />,
    title: "Personaliza tu CV",
    description: "Ajusta y optimiza tu CV según la oferta laboral.",
  },
  {
    icon: <Download className="w-12 h-12 text-blue-500" />,
    title: "Descarga tu CV",
    description: "Obtén tu CV personalizado en PDF con el diseño que prefieras.",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">¿Cómo Funciona?</h2>
        <div className="flex flex-wrap justify-center">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="w-full sm:w-1/2 md:w-1/3 px-4 mb-8"
            >
              <Card className="h-full flex flex-col items-center text-center p-6 bg-gray-100 rounded-lg">
                {step.icon}
                <h3 className="text-xl font-semibold mt-4 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Componentes de Shadcn/ui usados: Container, Card
