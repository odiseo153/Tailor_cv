"use client";

import Link from "next/link"
import { motion } from "framer-motion"
import { nameApp } from "../utils/NameApp";

export default function Header(){

    return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/" className="text-2xl font-bold text-gray-800">
              {nameApp}
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/generar-cv"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Probar Ahora
            </Link>
          </motion.div>
        </div>
      </nav>
    </header>
  )
}


