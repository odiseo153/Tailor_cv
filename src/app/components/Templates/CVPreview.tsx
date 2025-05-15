"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ImageOff, Trash2, Check, Eye, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/app/context/AppContext"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import { useI18n } from "@/app/context/I18nContext"

// Dynamic import to avoid SSR issues with pdfjs
const PdfPreviewGenerator = dynamic(
  () => import('./PdfPreviewGenerator'),
  { ssr: false }
);

interface CVTemplate {
  id: number | string
  name: string
  pdfUrl: string
  pngUrl?: string
  author: string
}

interface CVPreviewProps {
  template: CVTemplate
  onClick: () => void
  isSelected: boolean
  onDelete: () => void
}

/**
 * Displays a preview card for a CV template in the gallery.
 * Shows a preview image (pngUrl) or a placeholder.
 * Triggers onClick when the card is clicked.
 */
export default function CVPreview({ template, onClick, isSelected, onDelete }: CVPreviewProps) {
  const { templateId } = useStore();
  const { t } = useI18n();
  const isSelectedTemplate = templateId === template.id.toString();
  const [previewImage, setPreviewImage] = useState<string | null>(template.pngUrl || null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  
  useEffect(() => {
    // If we don't have a preview image and we have a PDF URL, we generate the preview
    if (!template.pngUrl && template.pdfUrl) {
      setIsGeneratingPreview(true);
    }
  }, [template.pdfUrl, template.pngUrl]);

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent parent container onClick from triggering
    onDelete();
  };
  
  const handlePreviewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent parent container onClick from triggering
    setShowPdfPreview(true);
  };

  const handlePreviewGenerated = (dataUrl: string | null, error: boolean = false) => {
    setIsGeneratingPreview(false);
    setPreviewImage(dataUrl);
    setPreviewError(error);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      onClick={onClick}
      className={`relative group cursor-pointer rounded-lg overflow-hidden h-[280px] ${
        isSelectedTemplate ? "ring-2 ring-green-500 ring-offset-2" : "shadow-md hover:shadow-lg"
      } transition-all duration-200`}
    >
      {/* Hidden component for PDF processing (browser-only) */}
      {isGeneratingPreview && !previewImage && (
        <PdfPreviewGenerator 
          pdfUrl={template.pdfUrl} 
          onComplete={handlePreviewGenerated} 
        />
      )}

      {isSelectedTemplate && (
        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}
      <Card className="w-full h-full flex flex-col">
        <CardContent className="p-0 flex-grow flex flex-col items-center justify-center bg-gray-50 relative">
          {isGeneratingPreview ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="mt-2 text-xs text-gray-500">{t("cv_generator.template.generating_preview", "Generando vista previa...")}</span>
            </div>
          ) : previewImage ? (
            <>
              <img
                src={previewImage}
                alt={`${t("cv_generator.template.preview", "Vista previa de")} ${template.name}`}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={() => setPreviewError(true)}
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 bg-gray-800 text-white"
                  onClick={handlePreviewClick}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : previewError ? (
            <div className="flex flex-col items-center justify-center text-amber-500 h-full w-full bg-amber-50">
              <AlertCircle size={48} />
              <span className="mt-2 text-xs">{t("cv_generator.template.error_loading", "Error al cargar preview")}</span>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-amber-600 hover:text-amber-800"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGeneratingPreview(true);
                }}
              >
                {t("cv_generator.template.retry", "Reintentar")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 h-full w-full bg-gray-100">
              <ImageOff size={48} />
              <span className="mt-2 text-xs">{t("cv_generator.template.no_preview", "Sin vista previa")}</span>
            </div>
          )}
        </CardContent>
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-800 truncate" title={template.name}>
              {template.name}
            </p>
            <Button 
              variant="destructive" 
              size="icon"
              className="h-8 w-8 ml-2"
              onClick={handleDelete}
              aria-label={t("cv_generator.template.delete", "Eliminar")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t("cv_generator.template.by", "Por")}: {template.author}</p>
        </div>
      </Card>

      {/* Dialog to display the full PDF */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{t("cv_generator.template.preview", "Vista previa de")} {template.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden p-1">
            <iframe
              src={template.pdfUrl}
              title={`PDF ${t("cv_generator.template.preview", "Vista previa de")} - ${template.name}`}
              className="w-full h-full border-0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}