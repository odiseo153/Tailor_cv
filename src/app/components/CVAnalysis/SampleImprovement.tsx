"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImprovedSample } from "../../types/cv-analysis";
import { useI18n } from "../../context/I18nContext";

interface SampleImprovementProps {
  samples: ImprovedSample[];
}

export default function SampleImprovement({ samples }: SampleImprovementProps) {
  const { t } = useI18n();
  if (samples.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-xl border-2 border-amber-200 bg-amber-50"
      role="region"
      aria-labelledby="sample-improvements-title"
    >
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-amber-600" />
        <h3 id="sample-improvements-title" className="text-lg font-semibold text-gray-800">
          Before & After Examples
        </h3>
        <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-300">
          {samples.length} {samples.length === 1 ? 'example' : 'examples'}
        </Badge>
      </div>
      
      <div className="space-y-6">
        {samples.map((sample, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-5 rounded-lg border border-amber-200 shadow-sm"
          >
            <div className="mb-4">
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                {sample.section}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Before */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                  ❌ Before
                </h4>
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-gray-700 font-mono leading-relaxed">
                    {sample.before}
                  </p>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-amber-500" />
              </div>
              
              {/* After */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                  ✅ After
                </h4>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-gray-700 font-mono leading-relaxed">
                    {sample.after}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Explanation */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">
                💡 Why this works:
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                {sample.explanation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-amber-100 rounded-lg border border-amber-200">
        <div className="flex items-start gap-2 text-amber-800">
          <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm mb-1">
              How to apply these improvements:
            </p>
            <p className="text-sm leading-relaxed">
              Use these examples as templates for similar sections in your CV. Focus on quantifiable achievements, 
              action verbs, and specific results that demonstrate your impact.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
