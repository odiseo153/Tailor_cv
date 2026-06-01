"use client";

import { useState } from "react";
import { FileSearch, Sparkles } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AnalyzeCVModule } from "./components/AnalyzeCVModule";
import { GenerateCVModule } from "./components/GenerateCVModule";
import type { CVAnalysisTab } from "../types/cv-analysis";

export default function GenerarCVPage() {
  const [activeTab, setActiveTab] = useState<CVAnalysisTab>("generate");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <div className="z-50 flex-shrink-0 border-b bg-white px-4 py-2 shadow-sm">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as CVAnalysisTab)}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl bg-gray-100 p-1">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate CV
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                CV Analysis
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {activeTab === "generate" ? <GenerateCVModule /> : <AnalyzeCVModule />}
    </div>
  );
}
