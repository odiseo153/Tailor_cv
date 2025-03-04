"use client";

import { motion } from "framer-motion";
import { Upload, Edit, Download, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";


const steps = [
  {
    icon: <Upload className="w-8 h-8 text-blue-600" />,
    title: "Sube tu oferta laboral",
    description: "Carga el PDF o texto de la oferta de trabajo que te interesa.",
  },
  {
    icon: <Edit className="w-8 h-8 text-blue-600" />,
    title: "Personaliza tu CV",
    description: "Ajusta y optimiza tu CV según la oferta laboral.",
  },
  {
    icon: <Download className="w-8 h-8 text-blue-600" />,
    title: "Descarga tu CV",
    description: "Obtén tu CV personalizado en PDF con el diseño que prefieras.",
  }, 
  {
    icon: <Timer className="w-8 h-8 text-blue-600" />,
    title: "Ahorra tiempo",
    description: "Obtén tu CV personalizado en poco tiempo.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-14">
          🚀 ¿Cómo Funciona?
        </h2>
        <div className="flex flex-wrap justify-center gap-5">
          {steps.map((step, index) => (
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
                  {step.icon}
                </div>

                <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                  {step.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
