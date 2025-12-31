import React from "react";
import { useCVStore, ContentItem } from "@/stores/useCVStore";

interface EditableElementProps {
  sectionId: string;
  subSectionId?: string;
  item: ContentItem;
}

export const EditableElement = ({
  sectionId,
  subSectionId,
  item,
}: EditableElementProps) => {
  const { selectElement, selectedElement } = useCVStore();

  const isSelected =
    selectedElement?.itemId === item.id &&
    selectedElement?.sectionId === sectionId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement({
      sectionId,
      subSectionId,
      itemId: item.id,
      type: "item",
    });
  };

  const commonClasses = `cursor-pointer transition-colors duration-200 ${
    isSelected
      ? "ring-2 ring-blue-400 rounded-sm bg-blue-50/50"
      : "hover:bg-gray-50"
  }`;

  if (item.type === "text") {
    return (
      <div
        onClick={handleClick}
        className={commonClasses}
        style={{
          ...item.styles,
          display: "block", // Asegurar que toma el ancho necesario
          minHeight: "1em",
        }}
      >
        {item.value || <span className="text-gray-300 italic">Vacío</span>}
      </div>
    );
  }

  // TODO: Add Image support
  return null;
};
