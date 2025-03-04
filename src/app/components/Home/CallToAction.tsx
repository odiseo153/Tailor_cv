"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CallToAction() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-700 to-blue-500">
      <div className="container mx-auto px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-white mb-6"
        >
          🚀 ¿Listo para crear tu CV perfecto?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg md:text-2xl text-white mb-10"
        >
          Empieza ahora y acércate al trabajo de tus sueños.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            href="/generar-cv"
            className="bg-white text-blue-700 font-semibold py-4 px-10 rounded-full text-lg shadow-lg hover:bg-gray-100 transition-all duration-300"
          >
            Genera tu CV Ahora
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
