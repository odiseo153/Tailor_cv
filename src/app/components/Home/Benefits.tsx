import { BarChart3, Clock, Briefcase, RefreshCw } from "lucide-react"

export default function Benefits() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">¿Por qué elegir TailorCV?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestra plataforma te da la ventaja competitiva en el mercado laboral actual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Obtenga 4x más entrevistas */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <BarChart3 className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Obtenga 4x más entrevistas</h3>
            <p className="text-gray-600 mb-4">
              Nuestros currículums optimizados han demostrado aumentar las devoluciones de llamadas de entrevista en un 400%.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div className="bg-gray-400 h-2.5 rounded-full w-1/4"></div>
                </div>
                <span className="text-xs font-medium text-gray-500 w-16">Estándar</span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div className="bg-blue-600 h-2.5 rounded-full w-full animate-pulse"></div>
                </div>
                <span className="text-xs font-medium text-blue-600 w-16">TailorCV</span>
              </div>
            </div>
          </div>

          {/* Ahorre 10 horas/semana */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <Clock className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Ahorre 10 horas/semana</h3>
            <p className="text-gray-600 mb-4">
              Deje de editar manualmente su currículum para cada solicitud. Nuestro AI lo hace en minutos.
            </p>

            <div className="mt-4 relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-600">Tiempo ahorrado</span>
                </div>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className="flex-1">
                    <div className="bg-green-500 h-16 rounded-t-sm"></div>
                    <div className="text-xs text-center mt-1">Día {day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Perfiles adaptables */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
              <Briefcase className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Perfiles adaptables</h3>
            <p className="text-gray-600 mb-4">Personalice su currículum para diferentes industrias y regiones con un solo clic.</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                <option>Tecnología</option>
                <option>Finanzas</option>
                <option>Atención médica</option>
                <option>Marketing</option>
              </select>
              <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                <option>Estados Unidos</option>
                <option>Reino Unido</option>
                <option>Unión Europea</option>
                <option>Australia</option>
              </select>
            </div>
          </div>

          {/* Actualizaciones con un solo clic */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
              <RefreshCw className="h-7 w-7 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Actualizaciones con un solo clic</h3>
            <p className="text-gray-600 mb-4">Mantenga su currículum actualizado con sincronización instantánea en todas las versiones.</p>

            
          </div>
        </div>
      </div>
    </section>
  )
}
