"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, Zap } from "lucide-react";
import { useI18n } from "../context/I18nContext";

interface ThinkingAnimationProps {
  message?: string;
  type?: "generate" | "analyze";
  progress?: number;
}

export default function ThinkingAnimation({ 
  message, 
  type = "generate", 
  progress = 0 
}: ThinkingAnimationProps) {
  const { t } = useI18n();

  const defaultMessages = {
    generate: t('thinking.generating_cv'),
    analyze: t('thinking.analyzing_cv')
  };

  const displayMessage = message || defaultMessages[type];

  // Animación de las partículas flotantes
  const particleVariants = {
    animate: {
      y: [-20, -40, -20],
      opacity: [0.4, 1, 0.4],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Animación del cerebro principal
  const brainVariants = {
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Animación de los puntos de pensamiento
  const dotVariants = {
    animate: (i: number) => ({
      scale: [0.5, 1.2, 0.5],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  };

  // Animación del progreso
  const progressVariants = {
    animate: {
      width: `${progress}%`,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Contenedor principal con partículas de fondo */}
      <div className="relative">
        {/* Partículas flotantes de fondo */}
        <div className="absolute inset-0 -m-8">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              variants={particleVariants}
              animate="animate"
              className="absolute"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${10 + (i % 3) * 20}%`,
              }}
            >
              {i % 3 === 0 ? (
                <Sparkles className="w-4 h-4 text-blue-400 opacity-60" />
              ) : i % 3 === 1 ? (
                <Zap className="w-3 h-3 text-purple-400 opacity-60" />
              ) : (
                <div className="w-2 h-2 bg-indigo-400 rounded-full opacity-60" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Cerebro principal */}
        <motion.div
          variants={brainVariants}
          animate="animate"
          className="relative z-10"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 scale-150"></div>
            
            {/* Cerebro */}
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6 shadow-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Puntos de pensamiento */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              variants={dotVariants}
              animate="animate"
              custom={i}
              className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Mensaje de pensamiento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-3"
      >
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {displayMessage}
        </h3>
        
        {/* Barra de progreso si se proporciona */}
        {progress > 0 && (
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              variants={progressVariants}
              animate="animate"
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
        )}
        
        {/* Texto animado de "thinking" */}
        <motion.p
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-gray-500 text-sm"
        >
          {t('thinking.processing')}
        </motion.p>
      </motion.div>

      {/* Ondas de energía */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeOut"
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
