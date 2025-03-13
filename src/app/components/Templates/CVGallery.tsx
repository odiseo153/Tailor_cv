'use client'

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CVModal from "./CVModal";
import CVPreview from "./CVPreview";
import { Message } from "@/app/utils/Message";
import { useAppContext } from "@/app/context/AppContext";

interface CVTemplate {
  id: number;
  name: string;
  html: string;
  image: string;
  author: string;
}

interface CVGalleryProps {
  templates: CVTemplate[];
}

export default function CVGallery({ templates }: CVGalleryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCV, setSelectedCV] = useState<CVTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(null);

  const {setTemplate} = useAppContext();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const openCVModal = (cv: CVTemplate) => {
    setSelectedCV(cv);
    setSelectedTemplate(cv);
  };

  const closeCVModal = () => {
    setSelectedCV(null);
    setSelectedTemplate(null);
  };

  const changeTemplate = (template:CVTemplate) => {
    setSelectedTemplate(template)
    setTemplate(template.html)
   // const po = localStorage.setItem("template", template.html);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewTemplate(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitTemplate = async () => {
    if (!newTemplate) {
      Message.errorMessage("Debes seleccionar un archivo antes de subirlo.");
      return;
    }

    const formData = new FormData();
    formData.append("template", newTemplate);

    try {
      const request = await fetch("/api/templates", {
        method: "POST",
        body: formData, 
      });

      const response = await request.json();
      console.log(response);

      Message.successMessage("Template subida con éxito"); // Alerta de éxito
      setNewTemplate(null); // Resetea el estado
      setPdfPreviewUrl(null); // Limpiar el preview
    } catch (e) {
      console.error("Error al subir el template:", e);
      Message.errorMessage("Error al subir el template, intenta nuevamente.");
    }
  };

  

 
  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button onClick={toggleExpand} className="flex items-center text-xl font-bold">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            <span className="ml-2">Plantillas de CV</span>
            <span className="ml-2 text-gray-500 font-normal">({templates.length})</span>
          </button>
        </div>
 
      </div>

      {isExpanded && (
        <>
          <p className="text-sm text-gray-600 mb-4">Hecho por Odiseo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Create from scratch card */}
            <Card className="flex flex-col items-center justify-center p-6 h-[300px] cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                <label htmlFor="upload-template" className="flex items-center justify-center cursor-pointer">
                  <input
                  placeholder="p"
                    id="upload-template"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Plus className="w-8 h-8 text-gray-500" />
                </label>
              </div>
              <p className="mt-4 text-center">{newTemplate ? newTemplate.name : "Subir Archivo"}</p>

              {/* Display PDF preview if available */}
              {pdfPreviewUrl && (
                <div className="mt-4 w-full h-64 border border-gray-300 rounded">
                  <iframe
                    src={pdfPreviewUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                  />
                </div>
              )}

              <Button className="mt-2" onClick={submitTemplate}>
                Subir
              </Button>
            </Card>

            {/* CV templates */}
            {templates.map((template) => (
              <div key={template.id} className=" items-center gap-4">
                <input
                  checked={selectedTemplate?.id === template.id}
                  type="radio"
                  name="selected-template"
                  id={`template-${template.id}`}
                  className=""
                  onChange={() => changeTemplate(template)}
                />
                <CVPreview template={template} onClick={() => openCVModal(template)} />
              </div>
            ))}
          </div>
        </>
      )}

      {selectedCV && <CVModal template={selectedCV} onClose={closeCVModal} />}
    </div>
  );
}
