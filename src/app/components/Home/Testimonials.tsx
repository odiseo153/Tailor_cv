"use client";

import { motion } from "framer-motion"
import Image from "next/image"

const testimonials = [
  {
    name: "Ana García",
    role: "Desarrolladora Web",
    content: "esto me ayudó a conseguir mi trabajo soñado. ¡El CV personalizado marcó la diferencia!",
    avatar: "https://wallpaperaccess.com/full/2725692.jpg",
  },
  {
    name: "Carlos Rodríguez",
    role: "Diseñador Gráfico",
    content: "Increíble herramienta. Ahorré horas de trabajo y obtuve un CV que realmente destaca.",
    avatar: "https://www.shutterstock.com/image-photo/smiling-young-middle-eastern-man-600nw-2063524544.jpg",
  },
  {
    name: "Laura Martínez",
    role: "Gerente de Marketing",
    content: "esto hizo que mi CV se adaptara perfectamente a cada oferta. ¡Altamente recomendado!",
    avatar: "https://wallpapers.com/images/hd/business-woman-pictures-m4oogkee4axy9a65.jpg",
  },
]


export default function Testimonials(){
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Lo que dicen nuestros usuarios</h2>
        <div className="flex flex-wrap justify-center">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="w-full md:w-1/3 px-4 mb-8"
            >
              <div className="bg-gray-100 rounded-lg p-6 h-full flex flex-col items-center text-center">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={100}
                  height={100}
                  className="rounded-full mb-4"
                />
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


