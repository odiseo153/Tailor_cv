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
    <div className="flex flex-col items-center justify-center py-12 space-y-10">

      {/* Icon + orbital rings */}
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Pulsing glow */}
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500"
        />

        {/* Orbital ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-violet-400/30"
          style={{ borderTopColor: "rgba(139,92,246,0.7)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-indigo-400/20"
          style={{ borderRightColor: "rgba(99,102,241,0.6)" }}
        />

        {/* Floating sparkles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            variants={particleVariants}
            animate="animate"
            transition={{ delay: i * 0.4 }}
            className="absolute"
            style={{
              top: `${[0, 85, 10, 75][i]}%`,
              left: `${[45, 45, 0, 85][i]}%`,
            }}
          >
            {i % 2 === 0
              ? <Sparkles className="w-3 h-3 text-violet-400" />
              : <Zap className="w-2.5 h-2.5 text-indigo-400" />
            }
          </motion.div>
        ))}

        {/* Central icon */}
        <motion.div
          variants={brainVariants}
          animate="animate"
          className="relative z-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-4 shadow-lg shadow-violet-500/25"
        >
          <Brain className="w-10 h-10 text-white drop-shadow" />
        </motion.div>
      </div>

      {/* Text block */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <h3 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          {displayMessage}
        </h3>

        {/* Thinking dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              variants={dotVariants}
              animate="animate"
              custom={i}
              className="block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-indigo-500"
            />
          ))}
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="w-56 h-1.5 rounded-full  overflow-hidden">
            <motion.div
              variants={progressVariants}
              animate="animate"
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
            />
          </div>
        )}

        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm text-gray-400"
        >
          {t('thinking.processing')}
        </motion.p>
      </motion.div>
    </div>
  );
}
