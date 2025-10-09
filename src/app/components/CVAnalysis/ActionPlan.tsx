"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActionPlanStep } from "../../types/cv-analysis";
import { useI18n } from "../../context/I18nContext";

interface ActionPlanProps {
  steps: ActionPlanStep[];
}

export default function ActionPlan({ steps }: ActionPlanProps) {
  const { t } = useI18n();
  if (steps.length === 0) {
    return (
      <div className="p-6 rounded-xl border-2 border-green-200 bg-green-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Plan</h3>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Your CV looks great! No immediate actions needed.</span>
        </div>
      </div>
    );
  }

  const totalTime = steps.reduce((total, step) => {
    const timeMatch = step.estimatedTime.match(/(\d+)/);
    return total + (timeMatch ? parseInt(timeMatch[1]) : 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-xl border-2 border-indigo-200 bg-indigo-50"
      role="region"
      aria-labelledby="action-plan-title"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 id="action-plan-title" className="text-lg font-semibold text-gray-800">
          Action Plan
        </h3>
        <div className="flex items-center gap-2 text-indigo-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Total time: ~{totalTime} minutes
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm relative"
          >
            {/* Step connector line */}
            {index < steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-indigo-200" />
            )}
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {step.step}
                </div>
              </div>
              
              <div className="flex-grow space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-800">{step.title}</h4>
                  <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-300">
                    {step.estimatedTime}
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
                
                {step.tools && step.tools.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                      Recommended Tools:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {step.tools.map((tool, toolIndex) => (
                        <Badge 
                          key={toolIndex} 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 mt-2">
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-indigo-100 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 text-indigo-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">
            Pro Tip: Complete these steps in order for the best results. Each improvement builds on the previous one!
          </span>
        </div>
      </div>
    </motion.div>
  );
}
