"use client";

import { Check, Eye, Heart, Search, X } from "lucide-react";
import { ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { AccordionItem, CVTemplate } from "../types";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  templates: CVTemplate[];
  selectedTemplate: CVTemplate | null;
  filteredTemplates: CVTemplate[];
  templateId: string;
  plantillaCV: File | null;
  previewTemplate: string | null;
  templateSearchOpen: boolean;
  templateSearchQuery: string;
  setTemplateSearchOpen: (open: boolean) => void;
  setTemplateSearchQuery: (value: string) => void;
  setPlantillaCV: (file: File | null) => void;
  setPreviewTemplate: (value: string | null) => void;
  setTemplateId: (id: string) => void;
  setHasExplicitlyClearedTemplate: (value: boolean) => void;
  clearSelectedTemplate: () => void;
  toggleFavoriteTemplate: (id: string, isFavorite: boolean) => void;
  handleFileChange: (
    e: ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview?: (preview: string | null) => void,
  ) => void;
  previewLabel: string;
};

export function TemplateSelector(props: Props) {
  const {
    isOpen,
    onToggle,
    title,
    selectedTemplate,
    filteredTemplates,
    templateId,
    plantillaCV,
    previewTemplate,
    templateSearchOpen,
    templateSearchQuery,
    setTemplateSearchOpen,
    setTemplateSearchQuery,
    setPlantillaCV,
    setPreviewTemplate,
    setTemplateId,
    setHasExplicitlyClearedTemplate,
    clearSelectedTemplate,
    toggleFavoriteTemplate,
    handleFileChange,
    previewLabel,
  } = props;

  return (
    <AccordionItem title={title} icon={Check} isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-4">
        {(selectedTemplate || plantillaCV) && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <div className="min-w-0">
              {plantillaCV ? (
                <span>
                  PDF manual activo: <span className="font-semibold">{plantillaCV.name}</span>
                </span>
              ) : selectedTemplate ? (
                <span>
                  Plantilla activa: <span className="font-semibold">{selectedTemplate.name}</span>
                </span>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-blue-700 hover:text-blue-800"
              onClick={() => {
                setPlantillaCV(null);
                setPreviewTemplate(null);
                clearSelectedTemplate();
              }}
            >
              <X size={14} className="mr-1" />
              Quitar
            </Button>
          </div>
        )}

        {!selectedTemplate && !plantillaCV && (
          <div className="rounded-2xl border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500">
            Sin plantilla. El CV se generará sin aplicar una plantilla base.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-gray-300 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Subir PDF</p>
            <p className="mb-3 text-sm text-gray-500">Usa tu propia plantilla en PDF.</p>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                clearSelectedTemplate();
                handleFileChange(e, setPlantillaCV, setPreviewTemplate);
              }}
              className="bg-gray-50"
            />
          </div>

          <div className="rounded-2xl border border-gray-200 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Plantillas disponibles</p>
            <p className="mb-3 text-sm text-gray-500">Abre el selector y busca entre las plantillas guardadas.</p>
            <Dialog
              open={templateSearchOpen}
              onOpenChange={(open) => {
                setTemplateSearchOpen(open);
                if (!open) {
                  setTemplateSearchQuery("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-start">
                  <Search size={16} className="mr-2" />
                  Seleccionar plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Seleccionar plantilla</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    placeholder="Buscar plantilla..."
                    className="bg-gray-50"
                  />
                  <div className="grid max-h-[65vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                    {filteredTemplates.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setPlantillaCV(null);
                          setPreviewTemplate(null);
                          setHasExplicitlyClearedTemplate(false);
                          setTemplateId(item.id);
                          setTemplateSearchOpen(false);
                          setTemplateSearchQuery("");
                        }}
                        className={`rounded-2xl border p-3 text-left transition ${
                          item.id === templateId ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                            <div className="mt-1 flex gap-2">
                              {item.isDefault && <Badge variant="secondary">Default</Badge>}
                              {item.isFavorite && <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Favorite</Badge>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleFavoriteTemplate(item.id, item.isFavorite);
                            }}
                          >
                            <Heart size={16} className={item.isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-400"} />
                          </Button>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                          {item.previewImage ? (
                            <img src={item.previewImage} alt={item.name} className="h-32 w-full object-cover" />
                          ) : (
                            <iframe srcDoc={item.templateHtml} title={item.name} className="h-32 w-full bg-white" />
                          )}
                        </div>
                      </button>
                    ))}
                    {filteredTemplates.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 md:col-span-2">
                        No hay plantillas que coincidan con la búsqueda.
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-gray-300 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Preview PDF manual</p>
          <p className="text-sm text-gray-500">Si subiste un PDF, puedes abrir su vista previa aquí abajo.</p>
        </div>
      </div>

      {previewTemplate && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-2 text-blue-600 w-full justify-start">
              <Eye size={16} className="mr-2" /> {previewLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
            </DialogHeader>
            <iframe src={previewTemplate} className="w-full h-96 rounded-lg border" />
          </DialogContent>
        </Dialog>
      )}
    </AccordionItem>
  );
}
