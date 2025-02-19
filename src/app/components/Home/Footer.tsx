"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { nameApp } from "@/app/utils/NameApp";
import { Card, CardContent } from "@/components/ui/card";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-12">
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo y descripción */}


          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-50">{nameApp}</h2>
            <p className="mt-2 text-sm text-gray-400">Tu CV perfecto en minutos</p>
          </div>


          {/* Enlaces rápidos */}
          <Card className="bg-gray-800 border-none shadow-md">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-50 mb-2">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/generar-cv" className="text-gray-300 hover:text-white transition-colors">
                    Generar CV
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>


          {/* Contacto */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold text-gray-50 mb-2">Contáctanos</h3>
            <p className="text-gray-400">odiseorincon@gmail.com</p>
            <p className="text-gray-400">+829-789-0766</p>
          </div>
        </div>


        <Separator className="my-8 border-gray-700" />


        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} CVGenius. Todos los derechos reservados.</p>
        </div>

      </div>
    </footer>
  );
}
