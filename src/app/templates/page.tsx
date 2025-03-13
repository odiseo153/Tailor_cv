import CVGallery from "../components/Templates/CVGallery"


export default function page() {
  const cvTemplates = [
    {
      id: 1,
      name: "Curriculum de Lorna Alvarado",
      html: `
      <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV Francisco Andrade</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex justify-center py-10">
    <div class="bg-white w-4/5 max-w-2xl shadow-lg p-8">
        <header class="border-l-4 border-black pl-4 mb-6">
            <h1 class="text-3xl font-bold">FRANCISCO <span class="block">ANDRADE</span></h1>
            <p class="text-gray-600 uppercase tracking-wide text-sm">Programador Web</p>
        </header>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Perfil</h2>
            <p class="text-gray-700 text-sm">Me recibí de Diseñador Web en el año 2020 y estoy en busca de un nuevo trabajo. Actualmente estoy cursando en el área de Marketing, especializado en redes sociales. Me considero una persona responsable y creativa.</p>
        </section>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Idiomas</h2>
            <p class="text-sm text-gray-700">Inglés: <span class="font-semibold">Avanzado</span></p>
            <p class="text-sm text-gray-700">Alemán: <span class="font-semibold">Intermedio</span></p>
        </section>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Educación</h2>
            <p class="text-sm text-gray-700"><span class="font-semibold">Licenciatura en Diseño Web</span> - Universidad de Córdoba (2018-2020)</p>
            <p class="text-sm text-gray-700 mt-2"><span class="font-semibold">Escuela Secundaria</span> - Colegio San Andrés (2010-2016)</p>
        </section>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Experiencia</h2>
            <div class="mb-4">
                <p class="font-semibold">Asistente de Gerencia</p>
                <p class="text-sm text-gray-700">Seguros de Agencia. Revisión de balances de documentos y control de facturación.</p>
            </div>
            <div class="mb-4">
                <p class="font-semibold">Pasante Administrativo</p>
                <p class="text-sm text-gray-700">Recepción en Clínicas. Organización de bases de datos y salas.</p>
            </div>
            <div>
                <p class="font-semibold">Atención al Público</p>
                <p class="text-sm text-gray-700">Mención en Clínicas personales. Asistencia y seguimiento de stock.</p>
            </div>
        </section>
        
        <section>
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Contacto</h2>
            <p class="text-sm text-gray-700"><span class="font-semibold">Dirección:</span> Calle Odugarse 125, Córdoba</p>
            <p class="text-sm text-gray-700"><span class="font-semibold">Teléfono:</span> (954) 123-4567</p>
            <p class="text-sm text-gray-700"><span class="font-semibold">Email:</span> hola@hotashotmail.com</p>
        </section>
    </div>
</body>
</html>

      `,
      image: "https://gdoc.io/uploads/teacher-cv-free-google-docs-template-t.jpg",
      author: "Canva Creators",
    },
    {
      id: 2,
      name: "Curriculum de Paloma Castillo",
      image: "https://marketplace.canva.com/EAFYID1Rg2Y/1/0/1131w/canva-curriculum-cv-resume-academico-minimalista-profesional-simple-blanco-kZdYE9UEmec.jpg",
      author: "Canva Creators",
      html: `
      <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV Isabela Fernández</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex justify-center py-10">
    <div class="bg-white w-4/5 max-w-2xl shadow-lg p-8">
        <header class="border-l-4 border-black pl-4 mb-6">
            <h1 class="text-3xl font-bold">ISABELA <span class="block">FERNÁNDEZ</span></h1>
            <p class="text-gray-600 uppercase tracking-wide text-sm">Lic. en Administración</p>
        </header>
        
        <section class="mb-6">
            <p class="text-gray-700 text-sm">Soy una persona organizada, analítica y responsable, con experiencia en el sector financiero y de ventas. Cuento con habilidades en resolución de problemas, administración de recursos y manejo de datos.</p>
        </section>
        
        <section class="grid grid-cols-2 gap-4 mb-6">
            <div>
                <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-2">Educación</h2>
                <p class="text-sm text-gray-700"><span class="font-semibold">2000 - 2014</span><br> Universidad Increíble<br> Lic. en Administración de Empresas</p>
                <p class="text-sm text-gray-700 mt-2"><span class="font-semibold">2004 - 2006</span><br> Colegio Secundario Ideal<br> Bachiller en Hotelería y Servicios</p>
            </div>
            <div>
                <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-2">Habilidades</h2>
                <ul class="text-sm text-gray-700 list-disc pl-4">
                    <li>Manejo de presupuestos y recursos</li>
                    <li>Solución de problemas en ventas</li>
                    <li>Administración financiera</li>
                    <li>Manejo y gestión de Redes Sociales</li>
                    <li>Inglés Avanzado</li>
                </ul>
            </div>
        </section>
        
        <section class="mb-6">
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Experiencia Laboral</h2>
            <div class="mb-4">
                <p class="font-semibold">Asistente de Gerencia</p>
                <p class="text-sm text-gray-700">Empresa Excel - Ago 2019 - Dic 2023</p>
                <p class="text-sm text-gray-700">Supervisión de documentos contables y financieros. Seguimiento de agenda. Manejo de base de datos de clientes y proveedores.</p>
            </div>
            <div class="mb-4">
                <p class="font-semibold">Asistente Administrativa</p>
                <p class="text-sm text-gray-700">Recepción en Clínicas - Ene 2016 - Jul 2017</p>
                <p class="text-sm text-gray-700">Atención al cliente. Manejo de documentos. Asesoría a nuevos pacientes. Organización de lista de entrada y salida.</p>
            </div>
            <div>
                <p class="font-semibold">Pasante Administrativa</p>
                <p class="text-sm text-gray-700">Eco Hotel - Dic 2016 - Jul 2017</p>
                <p class="text-sm text-gray-700">Manejo de bases de datos. Organización de turnos laborales.</p>
            </div>
        </section>
        
        <section>
            <h2 class="text-lg font-semibold border-b-2 border-gray-300 pb-1 mb-4">Contacto</h2>
            <p class="text-sm text-gray-700"><span class="font-semibold">Teléfono:</span> 1234 - 5678</p>
            <p class="text-sm text-gray-700"><span class="font-semibold">Email:</span> hola@isabelaf.email.com</p>
            <p class="text-sm text-gray-700"><span class="font-semibold">Dirección:</span> Calle Cualquier 123, Cualquier Lugar</p>
        </section>
    </div>
</body>
</html>

      `,
    }
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <CVGallery templates={cvTemplates} />
    </main>
  )
}

 