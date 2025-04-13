"use client"

import CVGallery from "../components/Templates/CVGallery"


export default function TemplatesPage() {

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Explora Plantillas de CV
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Elige entre nuestras plantillas personalizables para destacar en tu próxima solicitud de empleo.
        </p>
        <CVGallery />
      </section>
    </main>
  )
}



