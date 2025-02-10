"use client";

import Link from "next/link"
import { nameApp } from "../utils/NameApp";
import { Separator } from "@/components/ui/separator"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-12">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">{nameApp}</h2>
            <p className="mt-2 text-sm text-gray-400">Tu CV perfecto en minutos</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-gray-50 transition-colors duration-200">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/generar-cv" className="text-gray-300 hover:text-gray-50 transition-colors duration-200">
                  Generar CV
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4">Contáctanos</h3>
            <p className="text-gray-400">info@cvgenius.com</p>
            <p className="text-gray-400">+34 123 456 789</p>
          </div>
        </div>
        <Separator className="my-8 border-gray-700" />
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} CVGenius. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

// Componentes de Shadcn UI usados: Container, Separator
