"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Suggestion } from "../../types/cv-analysis";
import { useI18n } from "../../context/I18nContext";

interface SuggestionCardsProps {
  title: string;
  suggestions: Suggestion[];
  type: 'visual' | 'structural' | 'content';
}

export default function SuggestionCards({ title, suggestions, type }: SuggestionCardsProps) {
  const { t } = useI18n();
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visual': return 'border-blue-200 bg-blue-50';
      case 'structural': return 'border-purple-200 bg-purple-50';
      case 'content': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className={`p-6 rounded-xl border-2 ${getTypeColor(type)}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Great job! No major issues found in this area.</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-xl border-2 ${getTypeColor(type)}`}
      role="region"
      aria-labelledby={`suggestions-${type}`}
    >
      <h3 
        id={`suggestions-${type}`}
        className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
      >
        {title}
        <Badge variant="outline" className="ml-2">
          {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
        </Badge>
      </h3>
      
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getPriorityIcon(suggestion.priority)}
              </div>
              
              <div className="flex-grow space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-800">Issue:</h4>
                    {suggestion.priority && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                      >
                        {suggestion.priority} priority
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{suggestion.issue}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Solution:</h4>
                  <p className="text-gray-700 text-sm">{suggestion.fix}</p>
                </div>
                
                {suggestion.examples && suggestion.examples.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Examples:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {suggestion.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-gray-600 text-sm">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {suggestion.tools && suggestion.tools.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Recommended Tools:</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.tools.map((tool, toolIndex) => (
                        <Badge 
                          key={toolIndex} 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-700"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
