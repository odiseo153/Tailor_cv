"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useI18n } from "../../context/I18nContext";

interface ScoreDisplayProps {
  score: number;
  explanation: string;
  title: string;
}

export default function ScoreDisplay({ score, explanation, title }: ScoreDisplayProps) {
  const { t } = useI18n();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-8 h-8 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-8 h-8 text-yellow-600" />;
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-xl border-2 ${getScoreBgColor(score)} flex items-center gap-4`}
      role="region"
      aria-labelledby={`score-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex-shrink-0">
        {getScoreIcon(score)}
      </div>
      
      <div className="flex-grow">
        <div className="flex items-baseline gap-2 mb-2">
          <h3 
            id={`score-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-lg font-semibold text-gray-800"
          >
            {title}
          </h3>
          <span 
            className={`text-3xl font-bold ${getScoreColor(score)}`}
            aria-label={`Score: ${score} out of 100`}
          >
            {score}/100
          </span>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {explanation}
        </p>
      </div>
    </motion.div>
  );
}
