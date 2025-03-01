"use client";

import { motion } from "framer-motion";
import { Clock, Target, Palette, DockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { nameApp } from "@/app/utils/NameApp";

// Beneficios de usar la aplicación
const benefits = [
  {
    icon: <Clock className="w-12 h-12 text-blue-500" />,
    title: "Ahorro de Tiempo",
    description: "Genera un CV optimizado en minutos, no en horas.",
  },
  {
    icon: <Target className="w-12 h-12 text-blue-500" />,
    title: "CV Optimizado",
    description: "Personaliza tu CV para cada oferta laboral específica.",
  },
  {
    icon: <Palette className="w-12 h-12 text-blue-500" />,
    title: "Diseño Profesional",
    description: "Elige entre una variedad de plantillas profesionales y personalizables.",
  },
  {
    icon: <DockIcon className="w-12 h-12 text-blue-500" />,
    title: "Mejores Practicas",
    description: "Para generar el cv se usan las mejores practica dicha por los expertos recuiters",
  },
];

export default function Benefits() {
  return (
    <div className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        {/* Título de la sección */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Beneficios de Usar {nameApp}
        </h2>

        <div className="flex flex-wrap justify-center">
          {/* Mapeando los beneficios para mostrar los elementos de manera dinámica */}
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="w-full sm:w-1/2 md:w-1/3 px-4 mb-8"
            >
              {/* Componente Card para cada beneficio */}
              <Card className="h-full flex flex-col items-center text-center p-6 shadow-lg rounded-lg transition-transform transform hover:scale-105">
                {/* Icono del beneficio */}
                <div className="mb-4">{benefit.icon}</div>

                {/* Título del beneficio */}
                <h3 className="text-xl font-semibold mt-4 mb-2">{benefit.title}</h3>

                {/* Descripción del beneficio */}
                <p className="text-gray-600">{benefit.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
