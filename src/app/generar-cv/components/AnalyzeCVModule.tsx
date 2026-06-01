"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseIcon, FileSearch } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import type { ProgressCallback } from "../../Handler/CVHandler";
import { Message } from "../../utils/Message";
import { useI18n } from "../../context/I18nContext";
import {
  CVAnalysisFormData,
  CVAnalysisState,
} from "../../types/cv-analysis";
import {
  processUploadedCV,
  validateCVContent,
} from "../../utils/file-processing";
import { LoaderSpin } from "./LoaderSpin";

const AnalysisResults = dynamic(
  () => import("../../components/CVAnalysis/AnalysisResults"),
  {
    loading: () => (
      <div className="h-96 w-full animate-pulse rounded-xl bg-gray-100" />
    ),
    ssr: false,
  },
);

const ThinkingAnimation = dynamic(
  () => import("../../components/ThinkingAnimation"),
  {
    ssr: false,
  },
);

export function AnalyzeCVModule() {
  const { t, locale } = useI18n();
  const [analysisFormData, setAnalysisFormData] = useState<CVAnalysisFormData>({
    jobTitle: "",
    industry: "",
    cvFile: null,
  });
  const [analysisState, setAnalysisState] = useState<CVAnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
    progress: 0,
  });

  const handleAnalyzeCV = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!analysisFormData.jobTitle.trim()) {
      Message.errorMessage("Please enter a job title");
      return;
    }

    if (!analysisFormData.industry.trim()) {
      Message.errorMessage("Please enter an industry");
      return;
    }

    if (!analysisFormData.cvFile) {
      Message.errorMessage("Please upload a CV file");
      return;
    }

    setAnalysisState((prev) => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      result: null,
      progress: 0,
    }));

    try {
      setAnalysisState((prev) => ({ ...prev, progress: 10 }));
      const fileResult = await processUploadedCV(analysisFormData.cvFile);
      setAnalysisState((prev) => ({ ...prev, progress: 25 }));

      const validation = validateCVContent(fileResult.text);
      if (!validation.isValid) {
        console.warn("CV validation issues:", validation.issues);
      }

      const progressCallback: ProgressCallback = {
        onProgress: (progress) =>
          setAnalysisState((prev) => ({ ...prev, progress })),
      };

      const { CVHandler } = await import("../../Handler/CVHandler");
      const cvHandler = new CVHandler();

      const analysisResult = await cvHandler.analyzeCV(
        fileResult.text,
        analysisFormData.jobTitle,
        analysisFormData.industry,
        progressCallback,
        locale,
      );

      setAnalysisState((prev) => ({
        ...prev,
        result: analysisResult,
        progress: 100,
      }));
      Message.successMessage("CV analysis completed successfully!");
    } catch (error: any) {
      console.error("CV analysis error:", error);
      const errorMessage =
        error?.message || "Failed to analyze CV. Please try again.";
      setAnalysisState((prev) => ({ ...prev, error: errorMessage }));
      Message.errorMessage(errorMessage);
    } finally {
      setAnalysisState((prev) => ({ ...prev, isAnalyzing: false }));
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto max-w-7xl py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <motion.form
            onSubmit={handleAnalyzeCV}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-fit space-y-6 rounded-2xl border-2 bg-white p-6 shadow-xl sm:p-8 lg:col-span-2"
          >
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">
                {t("cv_analysis.title")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("cv_analysis.subtitle")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-700">
                  {t("cv_analysis.job_title_label")}
                </h2>
                <BriefcaseIcon className="h-5 w-5 text-gray-500" />
              </div>
              <Input
                type="text"
                value={analysisFormData.jobTitle}
                onChange={(e) =>
                  setAnalysisFormData((prev) => ({
                    ...prev,
                    jobTitle: e.target.value,
                  }))
                }
                placeholder={t("cv_analysis.job_title_placeholder")}
                className="rounded-xl border-gray-200 bg-gray-50"
                required
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-700">
                  {t("cv_analysis.industry_label")}
                </h2>
                <BriefcaseIcon className="h-5 w-5 text-gray-500" />
              </div>
              <Input
                type="text"
                value={analysisFormData.industry}
                onChange={(e) =>
                  setAnalysisFormData((prev) => ({
                    ...prev,
                    industry: e.target.value,
                  }))
                }
                placeholder={t("cv_analysis.industry_placeholder")}
                className="rounded-xl border-gray-200 bg-gray-50"
                required
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">
                {t("cv_analysis.upload_label")}
              </h2>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setAnalysisFormData((prev) => ({
                    ...prev,
                    cvFile: file,
                  }));
                }}
                className="rounded-xl border-gray-200 bg-gray-50"
                required
              />
              <p className="text-xs text-gray-500">
                {t("cv_analysis.upload_description")}
              </p>
            </div>

            <Button
              type="submit"
              disabled={
                analysisState.isAnalyzing ||
                !analysisFormData.jobTitle ||
                !analysisFormData.industry ||
                !analysisFormData.cvFile
              }
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-indigo-700"
            >
              {analysisState.isAnalyzing ? (
                <LoaderSpin />
              ) : (
                <span className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5" />
                  {t("cv_analysis.analyze_button")}
                </span>
              )}
            </Button>
          </motion.form>

          <div className="flex flex-col rounded-2xl border-2 bg-white p-3 shadow-xl lg:col-span-3">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">
              {t("cv_analysis.results_title")}
            </h2>
            <div className="min-h-[500px] flex-grow overflow-hidden rounded-lg bg-gray-50">
              {analysisState.isAnalyzing ? (
                <div className="flex h-full items-center justify-center">
                  <ThinkingAnimation
                    type="analyze"
                    progress={analysisState.progress}
                    message={t("thinking.analyzing_cv")}
                  />
                </div>
              ) : analysisState.result ? (
                <div className="h-full overflow-auto p-4">
                  <AnalysisResults result={analysisState.result} />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-gray-500">
                  <FileSearch size={48} className="mb-4 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">
                    {t("cv_analysis.ready_to_analyze")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
