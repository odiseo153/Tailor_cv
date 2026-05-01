"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CreditCard,
  FileClock,
  FileText,
  LayoutTemplate,
  SearchCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const capabilities = [
  {
    title: "Generar CVs con IA",
    description:
      "Convierte una oferta laboral en un CV adaptado usando texto, PDF o imagen como entrada.",
    href: "/generar-cv",
    icon: Sparkles,
    accent: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    title: "Analizar tu CV",
    description:
      "Sube tu CV y recibe puntuacion, mejoras de estructura y recomendaciones por puesto e industria.",
    href: "/generar-cv",
    icon: SearchCheck,
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    title: "Editar y exportar PDF",
    description:
      "Revisa la vista previa A4, ajusta el contenido generado y descarga el resultado final en PDF.",
    href: "/generar-cv",
    icon: FileText,
    accent: "bg-slate-50 text-slate-700 border-slate-200",
  },
  {
    title: "Gestionar tu perfil",
    description:
      "Guarda datos personales, experiencia, educacion, habilidades y redes para reutilizarlos en cada CV.",
    href: "/profile",
    icon: UserRound,
    accent: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    title: "Usar plantillas",
    description:
      "Elige plantillas disponibles, sube tus propios PDFs y marca favoritos para acelerar nuevas postulaciones.",
    href: "/templates",
    icon: LayoutTemplate,
    accent: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    title: "Historial por vacante",
    description:
      "Consulta CVs generados, filtra por fecha o estado y actualiza el avance del proceso.",
    href: "/cv-history",
    icon: FileClock,
    accent: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    title: "Buscar trabajo",
    description:
      "Encuentra vacantes por termino, ubicacion y fuentes confiables sin exponer claves externas.",
    href: "/buscar-trabajo",
    icon: BriefcaseBusiness,
    accent: "bg-green-50 text-green-700 border-green-100",
  },
  {
    title: "Suscripcion y pagos",
    description:
      "Consulta planes, gestiona facturacion y metodos de pago desde el panel de usuario.",
    href: "/plans",
    icon: CreditCard,
    accent: "bg-rose-50 text-rose-700 border-rose-100",
  },
];

const workflow = [
  "Crea tu perfil profesional una vez",
  "Pega o sube una oferta laboral real",
  "Genera, edita y exporta tu CV",
  "Guarda el historial y da seguimiento",
];

export default function Capabilities() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-800">
              <BadgeCheck className="h-4 w-4" />
              Plataforma completa para postular
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">
              Todo lo que puedes hacer en Tailor CV
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Desde encontrar una vacante hasta exportar un CV adaptado y dar
              seguimiento al proceso, la app concentra el flujo completo de
              postulacion.
            </p>
          </div>

          <div className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2 lg:w-[420px]">
            {workflow.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((capability) => {
            const Icon = capability.icon;

            return (
              <Link
                key={capability.title}
                href={capability.href}
                className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div
                  className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border ${capability.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-950">
                  {capability.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {capability.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-medium text-blue-700 group-hover:text-blue-900">
                  Abrir seccion
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
