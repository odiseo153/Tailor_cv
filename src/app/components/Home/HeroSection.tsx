"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { nameApp } from "@/app/utils/NameApp";
import CVPreview from "./CVPreview";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-100 py-24">
      <div className="container mx-auto px-8 flex flex-col-reverse md:flex-row items-center gap-12">
        
        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-1/2 md:pr-16 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
            <span className="text-blue-600">Tu CV Perfecto</span> en Minutos
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Crea CVs personalizados y optimizados para cada oferta laboral con la ayuda de inteligencia artificial.
          </p>
          <Link
            href="/generar-cv"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            🚀 Probar Ahora
          </Link>
        </motion.div>

        {/* Imagen */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:w-1/2"
        >
          <div className="relative w-full">
          <CVPreview />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
