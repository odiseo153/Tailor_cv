"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Check,  Download } from "lucide-react"
import { useStore } from "@/app/context/AppContext"
import { Message } from "@/app/utils/Message"

interface CVTemplate {
  id: number | string
  name: string
  pdfUrl: string
  pngUrl?: string
  author: string
}

interface CVModalProps {
  template: CVTemplate
  onClose: () => void
}

export default function CVModal({ template, onClose }: CVModalProps) {
  const { setTemplateId, templateId } = useStore();
  
  const isSelected = templateId === template.id.toString();
  
  const handleSelectTemplate = () => {
    setTemplateId(template.id.toString());
    Message.successMessage(`Plantilla "${template.name}" seleccionada como predeterminada`);
    onClose();
  }
  
  const handleDownload = () => {
    // Crear un enlace para descargar el PDF
    const link = document.createElement('a');
    link.href = template.pdfUrl;
    link.download = template.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  return (
    <Dialog open={!!template} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-xl">{template.name}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Creado por {template.author}
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSelectTemplate}
              variant={isSelected ? "outline" : "default"}
              className={isSelected ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" : ""}
              size="sm"
            >
              {isSelected ? (
                <><Check className="mr-1.5 h-4 w-4" /> Seleccionado</>
              ) : (
                <>Usar esta plantilla</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Download className="mr-1.5 h-4 w-4" /> Descargar
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onClose}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-grow overflow-hidden bg-gray-50 p-4">
          <div className="h-full w-full rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <iframe
              src={template.pdfUrl}
              title={`CV Preview - ${template.name}`}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

