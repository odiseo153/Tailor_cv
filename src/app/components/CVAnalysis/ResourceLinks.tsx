"use client";

import { motion } from "framer-motion";
import { ExternalLink, BookOpen, FileText, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Resource } from "../../types/cv-analysis";
import { useI18n } from "../../context/I18nContext";

interface ResourceLinksProps {
  resources: Resource[];
}

export default function ResourceLinks({ resources }: ResourceLinksProps) {
  const { t } = useI18n();
  if (resources.length === 0) {
    return null;
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'tool': return <FileText className="w-4 h-4" />;
      case 'template': return <FileText className="w-4 h-4" />;
      case 'guide': return <BookOpen className="w-4 h-4" />;
      case 'article': return <Newspaper className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'tool': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'template': return 'bg-green-100 text-green-700 border-green-300';
      case 'guide': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'article': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-xl border-2 border-teal-200 bg-teal-50"
      role="region"
      aria-labelledby="resources-title"
    >
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-teal-600" />
        <h3 id="resources-title" className="text-lg font-semibold text-gray-800">
          Helpful Resources
        </h3>
        <Badge variant="outline" className="ml-2 bg-teal-100 text-teal-700 border-teal-300">
          {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg border border-teal-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getResourceIcon(resource.type)}
              </div>
              
              <div className="flex-grow space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {resource.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getResourceColor(resource.type)}`}
                    >
                      {resource.type}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {resource.description}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-teal-700 border-teal-300 hover:bg-teal-100"
                  onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                  aria-label={`Open ${resource.title} in new tab`}
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Visit Resource
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-200">
        <div className="flex items-start gap-2 text-teal-800">
          <BookOpen className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm mb-1">
              Make the most of these resources:
            </p>
            <p className="text-sm leading-relaxed">
              Bookmark the tools and templates for future use. The guides and articles contain 
              valuable insights that can help you throughout your job search journey.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
