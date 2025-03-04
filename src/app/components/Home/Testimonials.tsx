"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Ana García",
    role: "Desarrolladora Web",
    content:
      "Esto me ayudó a conseguir mi trabajo soñado. ¡El CV personalizado marcó la diferencia!",
    avatar: "https://wallpaperaccess.com/full/2725692.jpg",
  },
  {
    name: "Carlos Rodríguez",
    role: "Diseñador Gráfico",
    content:
      "Increíble herramienta. Ahorré horas de trabajo y obtuve un CV que realmente destaca.",
    avatar:
      "https://www.shutterstock.com/image-photo/smiling-young-middle-eastern-man-600nw-2063524544.jpg",
  },
  {
    name: "Laura Martínez",
    role: "Gerente de Marketing",
    content:
      "Esto hizo que mi CV se adaptara perfectamente a cada oferta. ¡Altamente recomendado!",
    avatar:
      "https://wallpapers.com/images/hd/business-woman-pictures-m4oogkee4axy9a65.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-14">
          🗣️ Lo que dicen nuestros usuarios
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="w-full md:w-1/3"
            >
              <div className="h-full bg-white border border-gray-200 rounded-3xl p-8 shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-6">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <p className="text-gray-600 text-base italic mb-6 leading-relaxed">
                  “{testimonial.content}”
                </p>

                <h3 className="text-xl font-semibold text-gray-800">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
