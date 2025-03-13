"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { nameApp } from "@/app/utils/NameApp";
import { Card, CardContent } from "@/components/ui/card";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-100 py-16 mt-auto">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

          {/* Logo y descripción */}
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl font-extrabold text-white">{nameApp}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crea tu CV perfecto en minutos. Sube tu oferta laboral, personaliza tu plantilla y destaca profesionalmente.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <Card className="bg-gray-800/90 border border-gray-700 shadow-lg backdrop-blur-md hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <h3 className="text-xl font-semibold text-white">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/generar-cv" className="text-gray-300 hover:text-blue-400 transition-colors">
                    Generar CV
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contacto */}
          <div className="text-center md:text-right space-y-3">
            <h3 className="text-xl font-semibold text-white">Contáctanos</h3>
            <p className="text-gray-400 hover:text-gray-200 transition">
              <a href="mailto:odiseorincon@gmail.com">odiseorincon@gmail.com</a>
            </p>
            <p className="text-gray-400 hover:text-gray-200 transition">
              <a href="tel:+18297890766">+829-789-0766</a>
            </p>
          </div>
        </div>

        <Separator className="my-12 border-gray-700" />

        <div className="text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} <span className="font-semibold text-gray-300">{nameApp}</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
