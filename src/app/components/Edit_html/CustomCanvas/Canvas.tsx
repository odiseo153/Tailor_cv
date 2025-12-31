import React from "react";
import { useCVStore } from "@/stores/useCVStore";
import DraggableSection from "./DraggableSection";

export default function Canvas() {
  const { sections } = useCVStore();

  return (
    <div className="flex flex-col h-full w-full">
      {sections.map((section) => (
        <DraggableSection key={section.id} section={section} />
      ))}
    </div>
  );
}
