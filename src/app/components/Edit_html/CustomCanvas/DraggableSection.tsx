import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CVSection, useCVStore } from "@/stores/useCVStore";
import { GripVertical } from "lucide-react";
import { EditableElement } from "./EditableElement";

interface DraggableSectionProps {
  section: CVSection;
}

export default function DraggableSection({ section }: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const { selectElement, selectedElement } = useCVStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...section.styles,
    position: "relative" as const, // For positioning the handle
  };

  const isSelected =
    selectedElement?.sectionId === section.id &&
    selectedElement?.type === "section";

  const handleSectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement({ sectionId: section.id, type: "section" });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative hover:outline hover:outline-1 hover:outline-blue-300 ${
        isSelected ? "outline outline-2 outline-blue-500" : ""
      }`}
      onClick={handleSectionClick}
    >
      {/* Handle de arrastre - visible solo en hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded shadow-sm z-50 text-gray-500 hover:text-gray-800 hidden lg:block"
        title="Arrastrar sección"
      >
        <GripVertical size={20} />
      </div>

      {/* Renderizado de contenido basado en el tipo de sección */}
      <div className="relative">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 cursor-text w-full">
          {section.title}
        </h2>

        {/* Render Items */}
        {section.isList ? (
          <div className="space-y-4">
            {(section.items as CVSection[]).map((subSection) => (
              <div key={subSection.id} className="mb-4">
                {/* Simplificación: Renderizar items de la subsección */}
                {(subSection.items as any[]).map((item) => (
                  <EditableElement
                    key={item.id}
                    sectionId={section.id}
                    subSectionId={subSection.id}
                    item={item}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(section.items as any[]).map((item) => (
              <EditableElement
                key={item.id}
                sectionId={section.id}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
