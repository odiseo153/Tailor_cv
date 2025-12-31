import React from "react";
import { useCVStore } from "@/stores/useCVStore";
import { X } from "lucide-react";

export default function PropertyPanel() {
  const {
    selectedElement,
    sections,
    updateItemStyles,
    updateSectionStyles,
    updateContent,
    selectElement,
  } = useCVStore();

  if (!selectedElement) {
    return (
      <div className="p-6 text-center text-gray-500 mt-10">
        <p>Selecciona un elemento en el lienzo para editar sus propiedades.</p>
      </div>
    );
  }

  // Helper para buscar el objeto actual en el store
  const currentSection = sections.find(
    (s) => s.id === selectedElement.sectionId
  );
  if (!currentSection) return null;

  let currentItem: any = null;
  let currentStyles: any = {};
  let isSection = selectedElement.type === "section";

  if (isSection) {
    currentStyles = currentSection.styles;
  } else if (selectedElement.itemId) {
    if (selectedElement.subSectionId && currentSection.isList) {
      // Buscar dentro de la subsección (experiencia específica)
      const sub = (currentSection.items as any[]).find(
        (s: any) => s.id === selectedElement.subSectionId
      );
      if (sub) {
        currentItem = sub.items.find(
          (i: any) => i.id === selectedElement.itemId
        );
      }
    } else {
      // Sección simple
      currentItem = (currentSection.items as any[]).find(
        (i) => i.id === selectedElement.itemId
      );
    }

    if (currentItem) {
      currentStyles = currentItem.styles;
    }
  }

  // Handlers
  const handleStyleChange = (key: string, value: string) => {
    if (isSection) {
      updateSectionStyles(selectedElement.sectionId, { [key]: value });
    } else if (selectedElement.itemId && currentItem) {
      updateItemStyles(
        selectedElement.sectionId,
        selectedElement.itemId,
        { [key]: value },
        selectedElement.subSectionId
      );
    }
  };

  const handleContentChange = (value: string) => {
    if (selectedElement.itemId) {
      updateContent(
        selectedElement.sectionId,
        selectedElement.itemId,
        value,
        selectedElement.subSectionId
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm">
        <h3 className="font-semibold text-slate-800">Propiedades</h3>
        <button
          onClick={() => selectElement(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto flex-grow">
        {/* Editor de Contenido (Solo para items de texto) */}
        {!isSection && currentItem && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Contenido
            </label>
            <textarea
              value={currentItem.value}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[100px]"
              placeholder="Escribe el contenido aquí..."
            />
          </div>
        )}

        {/* Tipografía */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-1 block w-full">
            Tipografía
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Tamaño (px)
              </label>
              <input
                type="text"
                value={currentStyles.fontSize || ""}
                onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="ej. 16px"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentStyles.color || "#000000"}
                  onChange={(e) => handleStyleChange("color", e.target.value)}
                  className="w-8 h-8 p-0 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={currentStyles.color || ""}
                  onChange={(e) => handleStyleChange("color", e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Alineación
            </label>
            <div className="flex border rounded overflow-hidden">
              {["left", "center", "right", "justify"].map((align) => (
                <button
                  key={align}
                  onClick={() => handleStyleChange("textAlign", align)}
                  className={`flex-1 p-2 text-xs capitalize ${
                    currentStyles.textAlign === align
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Peso Fuente
            </label>
            <select
              value={currentStyles.fontWeight || "normal"}
              onChange={(e) => handleStyleChange("fontWeight", e.target.value)}
              className="w-full p-2 border rounded text-sm bg-white"
            >
              <option value="normal">Normal</option>
              <option value="bold">Negrita (Bold)</option>
              <option value="500">Medio (500)</option>
              <option value="300">Light (300)</option>
            </select>
          </div>
        </div>

        {/* Espaciado y Fondo */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-1 block w-full">
            Estilo Caja
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Fondo</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentStyles.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    handleStyleChange("backgroundColor", e.target.value)
                  }
                  className="w-6 h-6 p-0 border rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  {currentStyles.backgroundColor || "Transparent"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">
                Padding
              </label>
              <input
                type="text"
                value={currentStyles.padding || ""}
                onChange={(e) => handleStyleChange("padding", e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="ej. 10px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
