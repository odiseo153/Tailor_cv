"use client";

import { motion } from "framer-motion";
import { Calendar, Target, Building2, Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CVAnalysisResult } from "../../types/cv-analysis";
import { useI18n } from "../../context/I18nContext";
import ScoreDisplay from "./ScoreDisplay";
import SuggestionCards from "./SuggestionCards";
import ActionPlan from "./ActionPlan";
import SampleImprovement from "./SampleImprovement";
import ResourceLinks from "./ResourceLinks";
import { useState } from "react";

interface AnalysisResultsProps {
  result: CVAnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const { t } = useI18n();
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 px-2 sm:px-4 md:px-8 max-w-[900px] mx-auto"
      role="main"
      aria-labelledby="analysis-results-title"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2
            id="analysis-results-title"
            className="text-xl sm:text-2xl font-bold text-gray-800"
          >
{t('cv_analysis.results_title')}
          </h2>
          <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">{formatDate(result.analysisDate)}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">{t('cv_analysis.job_title_label')}:</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 px-2 py-0.5 text-xs sm:text-sm">
              {result.jobTitle}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">{t('cv_analysis.industry_label')}:</span>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 px-2 py-0.5 text-xs sm:text-sm">
              {result.industry}
            </Badge>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => setShowDetailedView(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4" />
              {t('cv_analysis.view_details')}
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Score - Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{t('cv_analysis.overall_score')}</h3>
          <div className="text-3xl font-bold text-blue-600">{result.overallScore}/100</div>
        </div>
        <p className="text-sm text-gray-600">{result.overallExplanation}</p>
      </div>

      {/* Quick Scores Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">{result.visual.score}</div>
          <div className="text-xs text-blue-700 font-medium">{t('cv_analysis.visual_design')}</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600 mb-1">{result.structural.score}</div>
          <div className="text-xs text-purple-700 font-medium">{t('cv_analysis.structure')}</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600 mb-1">{result.content.score}</div>
          <div className="text-xs text-green-700 font-medium">{t('cv_analysis.content_quality')}</div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <h4 className="font-semibold text-gray-800 mb-2">{t('cv_analysis.quick_summary')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">{t('cv_analysis.visual_improvements')}:</span>
            <span className="text-gray-600 ml-1">{result.visual.suggestions.length} {t('cv_analysis.suggestions_count', { count: result.visual.suggestions.length }.count.toString())}</span>
          </div>
          <div>
            <span className="font-medium text-purple-700">{t('cv_analysis.structural_enhancements')}:</span>
            <span className="text-gray-600 ml-1">{result.structural.suggestions.length} {t('cv_analysis.suggestions_count', { count: result.structural.suggestions.length }.count.toString())}</span>
          </div>
          <div>
            <span className="font-medium text-green-700">{t('cv_analysis.content_optimization')}:</span>
            <span className="text-gray-600 ml-1">{result.content.suggestions.length} {t('cv_analysis.suggestions_count', { count: result.content.suggestions.length }.count.toString())}</span>
          </div>
        </div>
      </div>

      {/* Suggestions Sections */}
      <div className="space-y-4 sm:space-y-6">
        <SuggestionCards
          title="Visual Improvements"
          suggestions={result.visual.suggestions}
          type="visual"
        />

        <SuggestionCards
          title="Structural Enhancements"
          suggestions={result.structural.suggestions}
          type="structural"
        />

        <SuggestionCards
          title="Content Optimization"
          suggestions={result.content.suggestions}
          type="content"
        />
      </div>

      {/* Keywords Section */}
      {(result.content.missingKeywords && result.content.missingKeywords.length > 0
        || result.content.recommendedKeywords && result.content.recommendedKeywords.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 sm:p-6 rounded-xl border-2 border-orange-200 bg-orange-50"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            Keyword Optimization
          </h3>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {result.content.missingKeywords && result.content.missingKeywords.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2 sm:mb-3 text-sm sm:text-base">Missing Keywords:</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {result.content.missingKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-red-100 text-red-700 border-red-300 px-2 py-0.5 text-xs sm:text-sm"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.content.recommendedKeywords && result.content.recommendedKeywords.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2 sm:mb-3 text-sm sm:text-base">Recommended Keywords:</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {result.content.recommendedKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-100 text-green-700 border-green-300 px-2 py-0.5 text-xs sm:text-sm"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Action Plan */}
      <ActionPlan steps={result.actionPlan} />

      {/* Sample Improvements */}
      <SampleImprovement samples={result.improvedSamples} />

      {/* Resources */}
      <ResourceLinks resources={result.resources} />

      {/* Footer */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
        <p className="text-gray-600 text-xs sm:text-sm">
          💡 <strong>Remember:</strong> These suggestions are tailored specifically for your target role as a{' '}
          <span className="font-semibold text-blue-600">{result.jobTitle}</span> in the{' '}
          <span className="font-semibold text-purple-600">{result.industry}</span> industry.
          Implementing these changes will help your CV stand out to both ATS systems and human recruiters.
        </p>
      </div>

      {/* Detailed View Modal */}
      {showDetailedView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetailedView(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{t('cv_analysis.detailed_analysis')}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {t('cv_analysis.detailed_description')}
                </p>
              </div>
              <Button
                onClick={() => setShowDetailedView(false)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-8">
              {/* Overall Score Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('cv_analysis.overall_score')}</h3>
                <ScoreDisplay
                  score={result.overallScore}
                  explanation={result.overallExplanation}
                  title={t('cv_analysis.overall_score')}
                />
              </div>

              {/* Detailed Scores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">{t('cv_analysis.visual_design')}</h4>
                  <ScoreDisplay
                    score={result.visual.score}
                    explanation={result.visual.explanation}
                    title={t('cv_analysis.visual_design')}
                  />
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4">{t('cv_analysis.structure')}</h4>
                  <ScoreDisplay
                    score={result.structural.score}
                    explanation={result.structural.explanation}
                    title={t('cv_analysis.structure')}
                  />
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-4">{t('cv_analysis.content_quality')}</h4>
                  <ScoreDisplay
                    score={result.content.score}
                    explanation={result.content.explanation}
                    title={t('cv_analysis.content_quality')}
                  />
                </div>
              </div>

              {/* Detailed Suggestions */}
              <div className="space-y-8">
                <SuggestionCards
                  title={t('cv_analysis.visual_improvements')}
                  suggestions={result.visual.suggestions}
                  type="visual"
                />
                <SuggestionCards
                  title={t('cv_analysis.structural_enhancements')}
                  suggestions={result.structural.suggestions}
                  type="structural"
                />
                <SuggestionCards
                  title={t('cv_analysis.content_optimization')}
                  suggestions={result.content.suggestions}
                  type="content"
                />
              </div>

              {/* Action Plan */}
              {result.actionPlan && result.actionPlan.length > 0 && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <ActionPlan steps={result.actionPlan} />
                </div>
              )}

              {/* Sample Improvements */}
              {result.improvedSamples && result.improvedSamples.length > 0 && (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <SampleImprovement samples={result.improvedSamples} />
                </div>
              )}

              {/* Resources */}
              {result.resources && result.resources.length > 0 && (
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                  <ResourceLinks resources={result.resources} />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
