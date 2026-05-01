"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CVTemplate = {
  id: string;
  name: string;
  previewImage: string | null;
  templateHtml: string;
  isDefault: boolean;
  isFavorite: boolean;
  author: { name: string; profilePicture: string | null } | null;
};

export default function CVGallery() {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((payload) => setTemplates(payload.templates || []))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleFavorite = async (templateId: string, currentStatus: boolean) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId ? { ...t, isFavorite: !currentStatus } : t
      )
    );
    try {
      await fetch("/api/templates/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, favorite: !currentStatus }),
      });
    } catch (error) {
      // Revert on error
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId ? { ...t, isFavorite: currentStatus } : t
        )
      );
    }
  };

  if (isLoading) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Cargando plantillas...
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="flex flex-col h-full overflow-hidden border-gray-200 transition-shadow hover:shadow-md cursor-pointer" onClick={() => setPreviewTemplate(template)}>
            <CardContent className="flex flex-col h-full p-0">
              <div className="relative h-72 shrink-0 overflow-hidden bg-gray-100 border-b border-gray-100 flex items-start justify-center">
                {template.previewImage ? (
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <iframe
                    srcDoc={template.templateHtml}
                    title={template.name}
                    className="absolute top-0 border-0 bg-white"
                    style={{
                      width: "800px",
                      height: "1130px",
                      transform: "scale(0.45)",
                      transformOrigin: "top center",
                      pointerEvents: "none",
                    }}
                    sandbox="allow-same-origin allow-scripts"
                  />
                )}
              </div>
              <div className="flex flex-col flex-1 gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">{template.name}</p>
                    <p className="text-sm text-gray-500">
                      Disponible en el generador
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {template.isDefault && <Badge variant="secondary">Default</Badge>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id, template.isFavorite);
                      }}
                      className={`rounded-full p-2 transition-colors ${
                        template.isFavorite
                          ? "bg-red-50 text-red-500 hover:bg-red-100"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                      aria-label="Toggle favorite"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={template.isFavorite ? "currentColor" : "none"}
                        stroke="currentColor"
                        className="h-5 w-5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-auto flex items-center h-8">
                  {template.author && (
                    <div className="flex items-center gap-2">
                      {template.author.profilePicture ? (
                        <img
                          src={template.author.profilePicture}
                          alt={template.author.name}
                          className="h-6 w-6 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                          {template.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-gray-600 font-medium line-clamp-1">
                        {template.author.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Modal de Detalle */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] flex flex-col p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-2xl">{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 relative bg-gray-200 border border-gray-300 rounded-md overflow-y-auto flex justify-center p-4">
            {previewTemplate?.previewImage ? (
              <img
                src={previewTemplate.previewImage}
                alt={previewTemplate.name}
                className="max-w-full h-auto object-contain bg-white shadow-sm"
              />
            ) : (
              <div className="w-full max-w-[800px] min-h-[1130px] bg-white shadow-sm border border-gray-200">
                <iframe
                  srcDoc={previewTemplate?.templateHtml}
                  title="Detalle"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
