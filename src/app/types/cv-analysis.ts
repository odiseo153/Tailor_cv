export interface CVAnalysisRequest {
  cvText: string;
  jobTitle: string;
  industry: string;
}

export interface Suggestion {
  issue: string;
  fix: string;
  tools?: string[];
  examples?: string[];
  priority?: 'high' | 'medium' | 'low';
}

export interface VisualAnalysis {
  score: number;
  explanation: string;
  suggestions: Suggestion[];
}

export interface StructuralAnalysis {
  score: number;
  explanation: string;
  suggestions: Suggestion[];
}

export interface ContentAnalysis {
  score: number;
  explanation: string;
  suggestions: Suggestion[];
  missingKeywords?: string[];
  recommendedKeywords?: string[];
}

export interface ActionPlanStep {
  step: number;
  title: string;
  description: string;
  estimatedTime: string;
  tools?: string[];
}

export interface ImprovedSample {
  section: string;
  before: string;
  after: string;
  explanation: string;
}

export interface Resource {
  title: string;
  url: string;
  description: string;
  type: 'tool' | 'template' | 'guide' | 'article';
}

export interface CVAnalysisResult {
  overallScore: number;
  overallExplanation: string;
  visual: VisualAnalysis;
  structural: StructuralAnalysis;
  content: ContentAnalysis;
  actionPlan: ActionPlanStep[];
  improvedSamples: ImprovedSample[];
  resources: Resource[];
  analysisDate: string;
  jobTitle: string;
  industry: string;
}

export interface FileProcessingResult {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'doc' | 'txt';
  wordCount: number;
}

export class FileProcessingError extends Error {
  code: 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'EXTRACTION_FAILED' | 'EMPTY_CONTENT';
  fileName?: string;

  constructor(code: FileProcessingError['code'], message: string, fileName?: string) {
    super(message);
    this.name = 'FileProcessingError';
    this.code = code;
    this.fileName = fileName;
  }
}

export type CVAnalysisTab = 'generate' | 'analyze';

export interface CVAnalysisFormData {
  jobTitle: string;
  industry: string;
  cvFile: File | null;
}

export interface CVAnalysisState {
  isAnalyzing: boolean;
  result: CVAnalysisResult | null;
  error: string | null;
  progress: number;
}
