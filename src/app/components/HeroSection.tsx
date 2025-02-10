"use client";

import Link from "next/link"
import  Image from "next/image";
import { motion } from "framer-motion"
import { nameApp } from "../utils/NameApp";

export default function HeroSection() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:w-1/2 mb-8 md:mb-0"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">{nameApp}: Tu CV Perfecto en Minutos</h1>
          <p className="text-xl text-gray-600 mb-6">
            Genera CVs personalizados y optimizados para cada oferta laboral con inteligencia artificial.
          </p>
          <Link
            href="/generar-cv"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 inline-block"
          >
            Probar Ahora 
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:w-1/2"
        >
          <Image
            src="https://c0.wallpaperflare.com/preview/535/539/778/resume-cv-resume-template-application.jpg"
            alt="CV Generation Illustration"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
          
        </motion.div>
      </div>
    </section>
  )
}

