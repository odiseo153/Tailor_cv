import React, { useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCVStore } from "@/stores/useCVStore";
import { parseHtmlToSections } from "@/stores/htmlParser";
import Canvas from "./Canvas";
import PropertyPanel from "./PropertyPanel";

interface CanvasEditorProps {
  initialHtml?: string;
}

export default function CanvasEditor({ initialHtml }: CanvasEditorProps) {
  const { sections, reorderSections, setSections } = useCVStore();

  useEffect(() => {
    if (initialHtml) {
      // Parsear el HTML y actualizar el estado
      const parsedSections = parseHtmlToSections(initialHtml);
      if (parsedSections.length > 0) {
        setSections(parsedSections);
      }
    }
  }, [initialHtml]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over?.id);

      reorderSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar de herramientas (reservado para futuro uso/componentes) */}
      <div className="hidden lg:block w-16 bg-white border-r border-gray-200 flex-shrink-0 z-10">
        {/* Iconos de herramientas aquí */}
      </div>

      {/* Área Principal (Canvas) */}
      <div className="flex-grow flex flex-col items-center p-8 overflow-y-auto max-h-screen">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl transition-all duration-200 ease-in-out transform origin-top">
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <Canvas />
            </SortableContext>
          </div>
        </DndContext>
      </div>

      {/* Panel de Propiedades (Derecha) */}
      <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto max-h-screen shadow-lg z-10">
        <PropertyPanel />
      </div>
    </div>
  );
}
