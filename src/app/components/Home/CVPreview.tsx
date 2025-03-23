
import React from 'react';
import { motion } from 'framer-motion';

interface CVPreviewProps {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  summary?: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  name = "Juan Pérez",
  title = "Diseñador Gráfico",
  email = "juan.perez@example.com",
  phone = "+123 456 7890",
  summary = "Diseñador gráfico con más de 5 años de experiencia, especializado en creación de branding, ilustración digital y diseño de campañas publicitarias. Dominio avanzado de Adobe Illustrator y Photoshop, con un portafolio que demuestra creatividad y atención al detalle. Apasionado por el diseño que comunica y emociona."
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6 w-full max-w-[500px] mx-auto text-left"
    >
      <div className="mb-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-2xl font-bold text-blue-600"
        >
          {name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-gray-600 text-lg"
        >
          {title}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="flex flex-wrap gap-4 mb-4"
      >
        <a href={`mailto:${email}`} className="text-blue-500 hover:text-blue-700 transition-colors">
          {email}
        </a>
        <a href={`tel:${phone}`} className="text-blue-500 hover:text-blue-700 transition-colors">
          {phone}
        </a>
        <a href="#" className="text-blue-500 hover:text-blue-700 transition-colors">
          LinkedIn
        </a>
        <a href="#" className="text-blue-500 hover:text-blue-700 transition-colors">
          Portafolio
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <h3 className="text-xl font-medium text-blue-600 mb-2">Resumen Profesional</h3>
        <p className="text-gray-700 text-base leading-relaxed mb-6">{summary}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <h3 className="text-xl font-medium text-blue-600 mb-2">Experiencia Laboral</h3>
        <div className="mb-4">
          <h4 className="font-medium text-lg">Diseñador Gráfico Senior</h4>
          <p className="text-sm text-gray-600">Agencia Creativa XYZ | Enero 2020 - Presente</p>
          <ul className="list-disc list-inside text-gray-700 text-sm">
            <li>Lideré el rediseño de branding para 10+ clientes, aumentando su reconocimiento de marca en un 30%.</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CVPreview;