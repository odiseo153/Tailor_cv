"use client";

import Link from "next/link"
import { motion } from "framer-motion"

export default function CallToAction() {
  return (
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-white mb-4"
        >
          ¿Listo para crear tu CV perfecto?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-white mb-8"
        >
          Comienza ahora y consigue el trabajo de tus sueños
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/generar-cv"
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-100 transition duration-300 inline-block"
          >
            Genera tu CV Ahora
          </Link>
        </motion.div>
      </div>
    </section>
  )
}


