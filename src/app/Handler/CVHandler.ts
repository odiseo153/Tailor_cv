import { jsonrepair } from "jsonrepair";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CVAnalysisResult } from "../types/cv-analysis";
import {
  buildAnalyzeCVSystemPrompt,
  buildAnalyzeCVUserPrompt,
  buildExtractCVInfoPrompt,
  buildGenerateCVSystemPrompt,
  buildGenerateCVUserPrompt,
  buildTemplateFromPdfPrompt,
} from "../utils/cv-prompts";

export interface ProgressCallback {
  onProgress?: (progress: number) => void;
  onInfoProcessed?: () => void;
  onTemplateProcessed?: () => void;
}

export interface AIModelConfig {
  provider: "groq" | "openrouter" | "deepseek" | "openai" | "gemini";
  modelId: string;
}

const API_CONFIG = {
  GEMINI: {
    key: process.env.GEMINI_API_KEY ?? "",
    model: "gemini-flash-latest",
  },
};

const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI.key);
const CSS_FRAMEWORK = "CSS";

// Call AI via server-side API route (avoids CSP issues)
async function callAIWithFallback(
  messages: { role: "system" | "user"; content: string }[],
  config?: AIModelConfig,
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      provider: config?.provider,
      modelId: config?.modelId,
    }),
  });

  const responseText = await res.text();
  let payload: { content?: string; error?: string } | null = null;

  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    throw new Error(
      payload?.error ||
        responseText ||
        `AI request failed with status ${res.status}`,
    );
  }

  if (!payload?.content) {
    throw new Error("AI response did not include generated content");
  }

  return payload.content;
}

export class CVHandler {
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private cleanGeneratedContent(raw: string, type: "html" | "json"): string {
    return raw
      .replace(type === "html" ? /```html|```/g : /```json|```/g, "")
      .trim()
      .replace(/\n{3,}/g, "\n\n");
  }

  async getInfoFromFile(
    file: File,
    fileType: "image" | "pdf",
    progressCallback?: ProgressCallback,
  ): Promise<any> {
    const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI.model });
    const prompt = buildExtractCVInfoPrompt(fileType);

    progressCallback?.onProgress?.(10);
    try {
      const fileData = await this.fileToBase64(file);
      progressCallback?.onProgress?.(25);

      const filePart = {
        inlineData: {
          data: fileData,
          mimeType: fileType === "pdf" ? "application/pdf" : "image/jpeg",
        },
      };

      const result = await model.generateContent([prompt, filePart]);
      const responseText = this.cleanGeneratedContent(
        (await result.response).text(),
        "json",
      );
      progressCallback?.onInfoProcessed?.();
      progressCallback?.onProgress?.(50);

      return jsonrepair(responseText);
    } catch (error) {
      console.error("Error extracting CV info:", error);
      throw new Error(`Failed to process ${fileType} file: ${error}`);
    }
  }

  async getPlantillaFromPdf(file: File): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: API_CONFIG.GEMINI.model,
      generationConfig: { temperature: 0.3 },
    });

    const prompt = buildTemplateFromPdfPrompt(CSS_FRAMEWORK);

    try {
      const base64Data = await this.fileToBase64(file);
      const parts = [
        { text: prompt },
        { inlineData: { mimeType: "application/pdf", data: base64Data } },
      ];
      const { response } = await model.generateContent(parts);

      return this.cleanGeneratedContent(response.text(), "html");
    } catch (error) {
      console.error("Error generating template:", error);
      throw new Error(`Failed to generate template: ${error}`);
    }
  }

  async getPlantillaById(
    templateId: string,
    progressCallback?: ProgressCallback,
  ): Promise<string> {
    try {
      const response = await fetch("/api/templates");
      if (!response.ok)
        throw new Error(`Failed to fetch templates: ${response.statusText}`);

      const payload = await response.json();
      const templates = payload.templates || [];
      
      if (templates.length === 0) {
        throw new Error("No templates available");
      }

      const template = templates.find(
        (t: any) => t.id.toString() === templateId,
      );
      if (!template)
        throw new Error(`Template with ID ${templateId} not found`);

      const templateHtml = template.templateHtml;
      if (!templateHtml) {
        throw new Error(`Template ${templateId} has no HTML content`);
      }

      return templateHtml;
    } catch (error) {
      console.error("Error fetching template by ID:", error);
      throw error;
    }
  }

  async generarCVAdaptado(
    ofertaTexto: string,
    infoCV: any,
    plantilla: string = "",
    infoAdicional: string = "",
    carrera: string = "",
    foto: string = "",
    progressCallback?: ProgressCallback,
    language: string = "en",
    modelConfig?: AIModelConfig,
  ): Promise<string> {
    const systemPrompt = buildGenerateCVSystemPrompt({
      cssFramework: CSS_FRAMEWORK,
      language,
      foto,
      infoAdicional,
      carrera,
    });

    const userPrompt = buildGenerateCVUserPrompt({
      cssFramework: CSS_FRAMEWORK,
      ofertaTexto,
      infoCV,
      language,
      plantilla,
      infoAdicional,
    });

    progressCallback?.onProgress?.(85);
    try {
      const content = await callAIWithFallback(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        modelConfig,
      );
      progressCallback?.onProgress?.(95);
      return this.cleanGeneratedContent(content, "html");
    } catch (error) {
      console.error("Error generating CV:", error);
      throw new Error(`CV generation failed: ${error}`);
    }
  }

  async analyzeCV(
    cvText: string,
    jobTitle: string,
    industry: string,
    progressCallback?: ProgressCallback,
    language: string = "en",
    modelConfig?: AIModelConfig,
  ): Promise<CVAnalysisResult> {
    const systemPrompt = buildAnalyzeCVSystemPrompt({
      language,
      jobTitle,
      industry,
      analysisDateISO: new Date().toISOString(),
    });

    const userPrompt = buildAnalyzeCVUserPrompt({
      cvText,
      jobTitle,
      industry,
      language,
    });

    progressCallback?.onProgress?.(25);
    try {
      const rawResponse = await callAIWithFallback(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        modelConfig,
      );
      progressCallback?.onProgress?.(75);
      const responseText = this.cleanGeneratedContent(rawResponse, "json");
      progressCallback?.onProgress?.(90);

      let analysisResult;
      try {
        analysisResult = JSON.parse(responseText);
      } catch {
        try {
          analysisResult = JSON.parse(jsonrepair(responseText));
        } catch {
          return {
            overallScore: 50,
            overallExplanation: "Analysis incomplete - please try again.",
            visual: {
              score: 50,
              explanation: "Analysis incomplete.",
              suggestions: [],
            },
            structural: {
              score: 50,
              explanation: "Analysis incomplete.",
              suggestions: [],
            },
            content: {
              score: 50,
              explanation: "Analysis incomplete.",
              suggestions: [],
              missingKeywords: [],
              recommendedKeywords: [],
            },
            actionPlan: [],
            improvedSamples: [],
            resources: [],
            analysisDate: new Date().toISOString(),
            jobTitle,
            industry,
          };
        }
      }
      progressCallback?.onProgress?.(100);
      return analysisResult;
    } catch (error) {
      console.error("Error analyzing CV:", error);
      throw new Error(`CV analysis failed: ${error}`);
    }
  }

  async extractJobOfferData(
    ofertaData: string | File,
    ofertaType: "text" | "image" | "pdf",
    progressCallback?: ProgressCallback,
    language: string = "en",
    modelConfig?: AIModelConfig,
  ): Promise<{
    skills: string[];
    requisitos: string[];
    seniority: string;
    keywords: string[];
    jobTitle: string;
    description: string;
  }> {
    progressCallback?.onProgress?.(5);

    let ofertaTexto: string;
    if (ofertaType === "text") {
      ofertaTexto = ofertaData as string;
      progressCallback?.onProgress?.(50);
    } else {
      const infoCV = await this.getInfoFromFile(
        ofertaData as File,
        ofertaType,
        progressCallback,
      );
      ofertaTexto =
        typeof ofertaData === "string" ? ofertaData : JSON.stringify(infoCV);
      progressCallback?.onProgress?.(60);
    }

    const systemPrompt = `You are an expert HR analyst specialized in job offer analysis. Your task is to extract structured information from job offers to help tailor CVs.

### Output Requirements
Return ONLY a valid JSON object with this exact structure:

{
  "skills": ["list of specific technical skills required"],
  "requisitos": ["list of requirements/qualifications"],
  "seniority": "Entry|Mid|Senior|Lead|Principal|Manager or description",
  "keywords": ["important keywords that should appear in the CV"],
  "jobTitle": "the job title or position",
  "description": "brief summary of the role"
}

### Guidelines:
- Be specific with skills (e.g., "React", "TypeScript", "PostgreSQL", not just "programming")
- Include both hard and soft skills
- Extract seniority level from required experience
- Keywords should be terms that ATS systems might search for
- ${language === "es" ? "Return everything in Spanish" : "Return everything in English"}`;

    const userPrompt = `Analyze this job offer and extract the structured information:

${ofertaTexto}

Return ONLY the JSON object.`;

    try {
      progressCallback?.onProgress?.(70);
      const rawResponse = await callAIWithFallback(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        modelConfig,
      );
      progressCallback?.onProgress?.(90);

      const responseText = this.cleanGeneratedContent(rawResponse, "json");
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = JSON.parse(jsonrepair(responseText));
      }

      progressCallback?.onProgress?.(100);
      return {
        skills: result.skills || [],
        requisitos: result.requisitos || [],
        seniority: result.seniority || "Mid",
        keywords: result.keywords || [],
        jobTitle: result.jobTitle || "",
        description: result.description || "",
      };
    } catch (error) {
      console.error("Error extracting job offer data:", error);
      throw new Error(`Failed to analyze job offer: ${error}`);
    }
  }

  async crearCV(
    data: any,
    type: "text" | "image" | "pdf",
    plantilla?: File | string,
    infoAdicional?: string,
    carrera?: string,
    foto?: string,
    templateId?: string,
    progressCallback?: ProgressCallback,
    language: string = "en",
    modelConfig?: AIModelConfig,
    jobOfferData?: {
      skills: string[];
      requisitos: string[];
      seniority: string;
      keywords: string[];
    },
  ): Promise<{ html: string }> {
    progressCallback?.onProgress?.(5);
    try {
      const infoCV =
        type === "text"
          ? data
          : await this.getInfoFromFile(data, type, progressCallback);
      if (type === "text") {
        progressCallback?.onInfoProcessed?.();
        progressCallback?.onProgress?.(50);
      }

      let plantillaHTML: string | null = null;
      if (plantilla && typeof plantilla !== "string") {
        plantillaHTML = await this.getPlantillaFromPdf(plantilla);
      } else if (templateId) {
        plantillaHTML = await this.getPlantillaById(
          templateId,
          progressCallback,
        );
      } else if (typeof plantilla === "string") {
        plantillaHTML = plantilla;
        progressCallback?.onTemplateProcessed?.();
        progressCallback?.onProgress?.(75);
      } else {
        progressCallback?.onTemplateProcessed?.();
        progressCallback?.onProgress?.(75);
      }

      const ofertaTexto = type === "text" ? data : JSON.stringify(infoCV);

      let additionalInfo = infoAdicional || "";
      if (
        jobOfferData &&
        (jobOfferData.skills.length > 0 || jobOfferData.keywords.length > 0)
      ) {
        const formattedData = `
Focus on these extracted requirements:
- Skills to highlight: ${jobOfferData.skills.join(", ")}
- Required qualifications: ${jobOfferData.requisitos.join(", ")}
- Seniority level: ${jobOfferData.seniority}
- Important keywords: ${jobOfferData.keywords.join(", ")}
        `.trim();
        additionalInfo = additionalInfo
          ? `${additionalInfo}\n${formattedData}`
          : formattedData;
      }

      const cvHtml = await this.generarCVAdaptado(
        ofertaTexto,
        infoCV,
        plantillaHTML || "",
        additionalInfo,
        carrera,
        foto,
        progressCallback,
        language,
        modelConfig,
      );

      progressCallback?.onProgress?.(100);
      return { html: cvHtml };
    } catch (error) {
      console.error("Error in crearCV:", error);
      throw error;
    }
  }
}
