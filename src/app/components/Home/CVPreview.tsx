import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Globe, Calendar, MapPin } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Session } from '@/app/api/auth/[...nextauth]/route';
import Image from 'next/image';

interface CVPreviewProps {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  summary?: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  name = "Juan Pérez",
  title = "Diseñador Gráfico Senior",
  email = "juan.perez@example.com",
  phone = "+123 456 7890",
  summary = "Diseñador gráfico con más de 5 años de experiencia, especializado en creación de branding, ilustración digital y diseño de campañas publicitarias. Dominio avanzado de Adobe Illustrator y Photoshop, con un portafolio que demuestra creatividad y atención al detalle."
}) => {
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: string;
  };
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  let userImage = null;
  
  if(status === "authenticated" && session?.user){
    const user = session.user;
    name = user.name as string;
    email = user.email as string;
    phone = user.phone as string;
    userImage = user.image;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-lg w-full max-w-[500px] mx-auto overflow-hidden font-sans"
    >
      {/* Header con color de fondo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
        <motion.div variants={itemVariants} className="relative z-10 flex items-center">
          {userImage && (
            <div className="mr-4 rounded-full overflow-hidden border-2 border-white h-16 w-16 flex-shrink-0">
              <Image 
                src={userImage} 
                alt={name || "Usuario"} 
                width={64} 
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold mb-1">{name}</h2>
            <p className="text-blue-100 text-lg">{title}</p>
          </div>
        </motion.div>
        
        {/* Formas decorativas */}
        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M42.8,-65.1C54.7,-56.9,63.2,-43.9,68.4,-29.5C73.5,-15.1,75.3,0.7,72.1,15.7C68.9,30.6,60.8,44.7,48.9,54.4C37,64.1,21.2,69.5,4.6,71.3C-12,73.1,-29.9,71.3,-43.7,62.9C-57.5,54.5,-67.3,39.6,-70.7,23.8C-74.2,8,-71.4,-8.7,-65.5,-23.3C-59.5,-37.9,-50.4,-50.3,-38.6,-58.6C-26.8,-67,-13.4,-71.3,0.9,-72.7C15.3,-74.1,30.5,-73.4,42.8,-65.1Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>
      
      {/* Información de contacto */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3 p-4 bg-gray-50 border-b border-gray-200 text-sm">
        <div className="flex items-center text-gray-600">
          <Mail size={14} className="mr-1 text-blue-500" />
          <a href={`mailto:${email}`} className="hover:underline">{email}</a>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone size={14} className="mr-1 text-blue-500" />
          <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
        </div>
        <div className="flex items-center text-gray-600">
          <Linkedin size={14} className="mr-1 text-blue-500" />
          <a href="#" className="hover:underline">linkedin.com/in/juanperez</a>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin size={14} className="mr-1 text-blue-500" />
          <span>Madrid, España</span>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Resumen */}
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-md font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center">
            <div className="w-6 h-0.5 bg-blue-600 mr-2"></div>
            Resumen Profesional
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
        </motion.div>

        {/* Experiencia */}
        <motion.div variants={itemVariants}>
          <h3 className="text-md font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center">
            <div className="w-6 h-0.5 bg-blue-600 mr-2"></div>
            Experiencia Laboral
          </h3>
          
          <div className="mb-4 relative pl-4 border-l-2 border-gray-200">
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
            <div className="mb-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-gray-800">Diseñador Gráfico Senior</h4>
                <div className="flex items-center text-gray-500 text-xs">
                  <Calendar size={12} className="mr-1" />
                  <span>2020 - Presente</span>
                </div>
              </div>
              <p className="text-blue-600 text-sm">Agencia Creativa XYZ</p>
            </div>
            <ul className="list-disc list-inside text-gray-600 text-sm mt-2 space-y-1">
              <li>Rediseño de branding para 10+ clientes, aumentando reconocimiento en un 30%</li>
              <li>Desarrollo de guías de estilo y sistemas de diseño para marcas globales</li>
            </ul>
          </div>
          
          <div className="relative pl-4 border-l-2 border-gray-200">
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
            <div className="mb-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-gray-800">Diseñador Gráfico Junior</h4>
                <div className="flex items-center text-gray-500 text-xs">
                  <Calendar size={12} className="mr-1" />
                  <span>2018 - 2020</span>
                </div>
              </div>
              <p className="text-blue-600 text-sm">Studio Creativo ABC</p>
            </div>
            <ul className="list-disc list-inside text-gray-600 text-sm mt-2 space-y-1">
              <li>Diseño de materiales promocionales para redes sociales y medios impresos</li>
            </ul>
          </div>
        </motion.div>
        
        {/* Footer con skills */}
        <motion.div variants={itemVariants} className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center">
            <div className="w-6 h-0.5 bg-blue-600 mr-2"></div>
            Habilidades
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Adobe Illustrator', 'Photoshop', 'UI/UX', 'Diseño Web', 'Branding'].map((skill, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CVPreview;