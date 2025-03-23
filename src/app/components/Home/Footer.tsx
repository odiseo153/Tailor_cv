"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { nameApp } from "@/app/utils/NameApp";
import { Card, CardContent } from "@/components/ui/card";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r bg-gray-800 text-gray-100 py-16 mt-auto">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo y descripción */}
          <div className="md:col-span-2 text-left space-y-4"> {/* Increased column span for larger screens */}
            <Link href="/" className="text-3xl font-extrabold text-white hover:text-indigo-300 transition-colors">
              {nameApp}
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crea tu CV perfecto en minutos. Sube tu oferta laboral, personaliza tu plantilla y destaca profesionalmente.
            </p>
          </div>

          {/* Contacto */}
          <div className="text-center md:text-right space-y-3">
            <h3 className="text-xl font-semibold text-white">Contáctanos</h3>
            <p className="text-gray-400 hover:text-gray-200 transition">
              <a href="mailto:odiseorincon@gmail.com" className="hover:underline">odiseorincon@gmail.com</a>
            </p>
            <p className="text-gray-400 hover:text-gray-200 transition">
              <a href="tel:+18297890766" className="hover:underline">+829-789-0766</a>
            </p>
          </div>
        </div>

        <Separator className="my-12 border-indigo-700" />

        <div className="text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} <span className="font-semibold text-indigo-300">{nameApp}</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
