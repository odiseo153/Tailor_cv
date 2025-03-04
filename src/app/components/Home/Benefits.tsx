"use client";

import { motion } from "framer-motion";
import { Clock, Target, Palette, DockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { nameApp } from "@/app/utils/NameApp";

// Beneficios de usar la aplicación
const benefits = [
  {
    icon: <Clock className="w-8 h-8 text-blue-600" />,
    title: "Ahorro de Tiempo",
    description: "Genera un CV optimizado en minutos, no en horas.",
  },
  {
    icon: <Target className="w-8 h-8 text-blue-600" />,
    title: "CV Optimizado",
    description: "Personaliza tu CV para cada oferta laboral específica.",
  },
  {
    icon: <Palette className="w-8 h-8 text-blue-600" />,
    title: "Diseño Profesional",
    description: "Elige entre una variedad de plantillas profesionales y personalizables.",
  },
  {
    icon: <DockIcon className="w-8 h-8 text-blue-600" />,
    title: "Mejores Prácticas",
    description: "Usamos técnicas validadas por expertos recruiters para destacar tu perfil.",
  },
];

export default function Benefits() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-14">
          🎯 Beneficios de usar {nameApp}
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="w-full sm:w-1/2 md:w-1/3"
            >
              <Card className="group h-full flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-blue-500">
                
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>

                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  {benefit.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
