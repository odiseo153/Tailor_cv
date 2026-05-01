"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { TagInput } from "./TagInput";

interface EditableJobDataProps {
  editableSkills: string;
  editableRequisitos: string;
  editableSeniority: string;
  editableKeywords: string;
  onSkillsChange: (value: string) => void;
  onRequisitosChange: (value: string) => void;
  onSeniorityChange: (value: string) => void;
  onKeywordsChange: (value: string) => void;
  onBack: () => void;
  onCreateCV: () => void;
  isLoading: boolean;
}

export function EditableJobData({
  editableSkills,
  editableRequisitos,
  editableSeniority,
  editableKeywords,
  onSkillsChange,
  onRequisitosChange,
  onSeniorityChange,
  onKeywordsChange,
  onBack,
  onCreateCV,
  isLoading,
}: EditableJobDataProps) {
  const skillsTags = editableSkills.split(",").map(s => s.trim()).filter(Boolean);
  const keywordsTags = editableKeywords.split(",").map(k => k.trim()).filter(Boolean);

  const handleSkillsChange = (tags: string[]) => {
    onSkillsChange(tags.join(", "));
  };

  const handleKeywordsChange = (tags: string[]) => {
    onKeywordsChange(tags.join(", "));
  };

  return (
    <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-lg p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Extracted Job Data
        </h3>
        <span className="text-xs text-gray-500">Edit before creating CV</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Skills</label>
          <TagInput
            tags={skillsTags}
            onChange={handleSkillsChange}
            placeholder="Type skill and press enter..."
            className="max-h-32 overflow-y-auto"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Requirements</label>
          <Textarea
            value={editableRequisitos}
            onChange={(e) => onRequisitosChange(e.target.value)}
            placeholder="Bachelor's degree, 3+ years experience, ..."
            className="h-20 bg-gray-50"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Seniority</label>
          <Input
            type="text"
            value={editableSeniority}
            onChange={(e) => onSeniorityChange(e.target.value)}
            placeholder="Mid, Senior, Lead, ..."
            className="bg-gray-50"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Keywords</label>
          <TagInput
            tags={keywordsTags}
            onChange={handleKeywordsChange}
            placeholder="Type keyword and press enter..."
            className="max-h-32 overflow-y-auto"
          />
        </div>
      </div>
      
      <div className="mt-6 flex gap-3 shrink-0">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onCreateCV}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Create CV
        </Button>
      </div>
    </div>
  );
}