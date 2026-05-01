"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ tags, onChange, placeholder = "Add tag...", className }: TagInputProps) {
  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value;
      if (value) {
        addTag(value);
        (e.target as HTMLInputElement).value = "";
      }
    } else if (e.key === "Backspace" && !(e.target as HTMLInputElement).value && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5 p-2 border rounded-md bg-gray-50", className)}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm max-w-full break-words"
        >
          <span className="truncate">{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="hover:bg-blue-200 rounded-full p-0.5 shrink-0"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder={tags.length === 0 ? placeholder : ""}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder:text-gray-400"
      />
    </div>
  );
}

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select...", className }: MultiSelectProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5 p-2 border rounded-md bg-gray-50 min-h-[80px]", className)}>
      {selected.length === 0 && options.length === 0 && (
        <span className="text-gray-400 text-sm p-1">{placeholder}</span>
      )}
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-md text-sm transition-colors",
            selected.includes(option)
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
        >
          {selected.includes(option) && (
            <span className="w-3 h-3 mr-1 rounded-full border border-white" />
          )}
          {option}
        </button>
      ))}
    </div>
  );
}