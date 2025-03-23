'use client'

import { useState } from 'react';
import { Search, Wand2, Check, FileSpreadsheet, Cpu, BarChart } from 'lucide-react';

export default function HowItWorks(){
  const [activeTab, setActiveTab] = useState(0);
  
  const steps = [
    {
      title: "Análisis Inteligente",
      icon: <Search className="feature-icon" />,
      description: "Nuestro AI analiza ofertas laborales y identifica:",
      features: [
        "Palabras clave técnicas (por ejemplo, Python, Scrum)",
        "Habilidades blandas requeridas (por ejemplo, liderazgo)",
        "Jerarquía de requisitos (priorizando lo esencial)"
      ],
      visual: (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div className="h-10 bg-white rounded-md border border-gray-200 flex items-center px-4">
              <div className="h-4 w-20 bg-primary/10 rounded"></div>
              <div className="h-4 w-4 bg-primary/20 rounded ml-2 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-8 bg-green-100 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded"></div>
                  <div className="h-3 w-4/5 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-8 bg-blue-100 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded"></div>
                  <div className="h-3 w-3/5 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Personalización Automática",
      icon: <Wand2 className="feature-icon" />,
      description: "Nuestro AI personaliza tu CV para que se adapte a los requisitos del trabajo:",
      features: [
        "Reorganiza habilidades según la importancia del trabajo",
        "Destaca experiencias más valiosas",
        "Ajusta el lenguaje para que se adapte a la cultura de la empresa"
      ],
      visual: (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex space-x-2">
              <div className="h-5 w-5 rounded-full bg-primary/20"></div>
              <div className="h-5 w-5 rounded-full bg-gray-200"></div>
              <div className="h-5 w-5 rounded-full bg-gray-200"></div>
            </div>
            <div className="h-6 w-20 bg-success/10 rounded-full flex items-center justify-center">
              <div className="h-2 w-12 bg-success rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            <div className="p-4 space-y-3">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 w-full bg-gray-100 rounded"></div>
              <div className="h-3 w-full bg-gray-100 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
              <div className="h-5 w-24 bg-gray-200 rounded my-4"></div>
              <div className="h-3 w-full bg-gray-100 rounded"></div>
              <div className="h-3 w-full bg-red-50 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
            </div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 w-full bg-gray-100 rounded"></div>
              <div className="h-3 w-full bg-green-50 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
              <div className="h-5 w-24 bg-gray-200 rounded my-4"></div>
              <div className="h-3 w-full bg-green-50 rounded"></div>
              <div className="h-3 w-full bg-gray-100 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Optimización Final",
      icon: <FileSpreadsheet className="feature-icon" />,
      description: "Nuestro AI asegura que tu CV pase todas las pruebas:",
      features: [
        "Ajuste de densidad de palabras clave (12-15%)",
        "Compatibilidad con ATS (sistemas de seguimiento de candidatos)",
        "Sugerencias de verbos de acción para cada industria"
      ],
      visual: (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Check size={18} className="text-green-500" />
              <div className="h-5 w-48 bg-gray-100 rounded"></div>
              <div className="h-5 w-12 bg-green-50 rounded text-xs flex items-center justify-center text-green-700">87%</div>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={18} className="text-green-500" />
              <div className="h-5 w-56 bg-gray-100 rounded"></div>
              <div className="h-5 w-12 bg-green-50 rounded text-xs flex items-center justify-center text-green-700">100%</div>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={18} className="text-green-500" />
              <div className="h-5 w-40 bg-gray-100 rounded"></div>
              <div className="h-5 w-12 bg-green-50 rounded text-xs flex items-center justify-center text-green-700">95%</div>
            </div>
            <div className="h-px w-full bg-gray-200 my-2"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-8 bg-gray-50 rounded border border-gray-200 flex items-center justify-center">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-50 rounded border border-gray-200 flex items-center justify-center">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-primary/5 rounded border border-primary/20 flex items-center justify-center">
                <div className="h-3 w-16 bg-primary/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="section bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark">Tecnología que Trabaja para tu Éxito</h2>
          <p className="text-gray-600 text-lg">Nuestro sistema inteligente analiza los requisitos del trabajo y optimiza tu CV en tiempo real, aumentando tus posibilidades de obtener entrevistas.</p>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-8">
          {/* Steps Navigation */}
          <div className="w-full md:w-1/2">
            <div className="sticky top-24 space-y-4">
              {steps.map((step, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-white shadow-lg border border-gray-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(index)}
                  >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      activeTab === index ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index === 0 ? <Cpu size={20} /> : index === 1 ? <Wand2 size={20} /> : <BarChart size={20} />}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        activeTab === index ? 'text-primary' : 'text-gray-700'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{step.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-fade-in">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  {steps[activeTab].icon}
                  <h3 className="text-2xl font-bold text-gray-900">{steps[activeTab].title}</h3>
                </div>
                <p className="text-gray-700 mb-4">{steps[activeTab].description}</p>

                <ul className="space-y-3 mb-8">
                  {steps[activeTab].features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Representation */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg border border-gray-100 animate-fade-in">
                {steps[activeTab].visual}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};