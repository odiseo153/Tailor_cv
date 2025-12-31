import { jsonrepair } from "jsonrepair";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validation_prompt } from "../utils/cv_validations";
import { CVAnalysisResult } from "../types/cv-analysis";
import { generateLanguageInstruction, generateCVLanguageInstruction } from "../utils/language-helper";

export interface ProgressCallback {
  onProgress?: (progress: number) => void;
  onInfoProcessed?: () => void;
  onTemplateProcessed?: () => void;
}

export interface AIModelConfig {
  provider: "groq" | "openrouter";
  modelId: string;
}

const API_CONFIG = {
  GEMINI: {
    key: process.env.NEXT_PUBLIC_API_URL_GEMINIS ?? "",
    model: "gemini-flash-latest",
  },
};

const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI.key);
const CSS_FRAMEWORK = "CSS";

// Call AI via server-side API route (avoids CSP issues)
async function callAIWithFallback(
  messages: { role: "system" | "user"; content: string }[],
  config?: AIModelConfig
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

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "AI request failed");
  }

  const data = await res.json();
  return data.content;
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
    progressCallback?: ProgressCallback
  ): Promise<any> {
    const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI.model });
    const prompt = `Extract CV information (${fileType}):\n
      { summary: "", workExperience: [], education: [], skills: [], projects: [], languages: [] }
      Return ONLY a valid JSON object.`;

    progressCallback?.onProgress?.(10);
    try {
      const fileData = await this.fileToBase64(file);
      progressCallback?.onProgress?.(25);

      const filePart = {
        inlineData: { data: fileData, mimeType: fileType === "pdf" ? "application/pdf" : "image/jpeg" },
      };

      const result = await model.generateContent([prompt, filePart]);
      const responseText = this.cleanGeneratedContent((await result.response).text(), "json");
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

    const prompt = `Generate valid HTML with ${CSS_FRAMEWORK} replicating the CV's visual layout and structure:
      - Use semantic HTML5, responsive layout (grid/flex), consistent spacing, and typography scale
      - Output should contain placeholder text for content (e.g., {{name}}, {{summary}}, {{experience_item}})
      - STRICT: Refrain from introducing any external CSS frameworks or scripts
      - Favor minimal, readable class names derived from the original PDF's visual groupings
      - Keep a single-page layout suitable for A4/PDF export
      - Return ONLY clean HTML code (no Markdown, no explanations).`;

    try {
      const base64Data = await this.fileToBase64(file);

      const parts = [{ text: prompt }, { inlineData: { mimeType: "application/pdf", data: base64Data } }];
      const { response } = await model.generateContent(parts);

      return this.cleanGeneratedContent(response.text(), "html");
    } catch (error) {
      console.error("Error generating template:", error);
      throw new Error(`Failed to generate template: ${error}`);
    }
  }

  async getPlantillaById(templateId: string, progressCallback?: ProgressCallback): Promise<string> {
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error(`Failed to fetch templates: ${response.statusText}`);

      const { pdfFiles } = await response.json();

      const template = pdfFiles.find((t: any) => t.id.toString() === templateId);
      if (!template) throw new Error(`Template with ID ${templateId} not found`);

      const pdfResponse = await fetch(template.pdfUrl);
      if (!pdfResponse.ok) throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);

      const pdfBlob = await pdfResponse.blob();
      const pdfFile = new File([pdfBlob], template.name, { type: "application/pdf" });

      return this.getPlantillaFromPdf(pdfFile);
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
    modelConfig?: AIModelConfig
  ): Promise<string> {

    const systemPrompt = `
    You are a senior CV designer and recruiter with deep expertise in crafting visually appealing, professional resumes in HTML using ${CSS_FRAMEWORK}.
    
    Your task is to generate a **single-page CV** perfectly aligned with a specific job offer, based on provided candidate data.
    
    ${generateLanguageInstruction(language)}
    
    ### 🎯 Output Requirements
    - Produce **clean, semantic, valid HTML5**, ready for PDF or Word export.
    - Design must be **responsive**, minimalist, and elegant, using ${CSS_FRAMEWORK}.
    - Typography: **10–12pt** for body text, **14–16pt** for headings.
    - Margins: **10mm** on all sides.
    - Emphasize skills, experiences, and achievements that **best match the job offer**.
    - Maintain consistent section hierarchy (e.g., Profile, Experience, Education, Skills, Contact Info).
    - Use professional, localized terminology for ${language}.
    - If a template HTML is provided, you MUST:
      1) Preserve the exact structural layout, section order, and container hierarchy
      2) Reuse the same class names and IDs; DO NOT rename classes or add frameworks
      3) Keep the same spacing, grid/flex structure, and typography scales
      4) Replace only the textual content and image sources while keeping elements and wrappers intact
      5) Do not introduce external CSS/JS; only inline or embedded ${CSS_FRAMEWORK} styles allowed
    - If no template is provided, create a modern, ATS-friendly layout using best UX/UI practices.
    - ${foto
        ? `Include the candidate photo (${foto}) if culturally appropriate for the target country.`
        : "Exclude the photo section for a neutral, global presentation."
      }
    - ${infoAdicional
        ? `Incorporate the following additional information where relevant: ${infoAdicional}.`
        : "Exclude any additional information not provided."
      }
    - ${carrera
        ? `Adapt structure, keywords, and achievements to align with the career field: ${carrera}.`
        : "Use a balanced, cross-industry approach for general applications."
      }
    
    ### ⚙️ Formatting Rules
    - Output **only HTML code** (no Markdown, explanations, or comments).
    - Use inline or embedded ${CSS_FRAMEWORK} styling—avoid external dependencies.
    - Ensure the design looks professional, clean, and export-friendly.
    - The result must feel **human-written**, with natural phrasing and contextual emphasis.
    
    ### 📌 ATS/HR Optimization Guidelines (Translate to ${language} and ENFORCE)
    The following expert recommendations must be applied to maximize ATS compatibility and recruiter screening success. Translate all content and headings to the target language and implement the practices within the generated HTML and text content.

    ${validation_prompt}

    Your goal: produce a **recruiter-ready HTML CV** that stands out visually and contextually.
    `.trim();

    const userPrompt = `
    Generate a **one-page HTML CV** using ${CSS_FRAMEWORK}.
    
    Job Offer:
    "${ofertaTexto}"
    
    Candidate Data:
    ${JSON.stringify(infoCV, null, 2)}
    
    ${generateCVLanguageInstruction(language)}
    
    ${plantilla ? `
    ### Template HTML (STRICTLY PRESERVE STRUCTURE & CLASSES)
    """
    ${plantilla}
    """
    
    CRITICAL Template Rules:
    - Reuse containers, wrappers, and section tags exactly as in the template
    - Keep all class names and IDs unchanged; do not add UI libraries
    - Replace placeholder text and image URLs only; do not alter DOM structure
    - Keep layout (grid/flex) and spacing scales intact
    ` : ''}
    
    ### Guidelines:
    - Tailor the CV to highlight **skills, experiences, and achievements** matching the job offer.
    - Ensure a **responsive, printable layout** that looks great on screen and in PDF.
    - ${infoAdicional
        ? `Include this additional information where relevant: ${infoAdicional}.`
        : "No additional information."
      }
    - Strictly apply the ATS/HR optimization guidelines provided in the system instructions (translated to the selected language)
    - Return **only valid HTML code**, without explanations or Markdown.
    `.trim();


    progressCallback?.onProgress?.(85);
    try {
      const content = await callAIWithFallback(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        modelConfig
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
    modelConfig?: AIModelConfig
  ): Promise<CVAnalysisResult> {

    const systemPrompt = `
You are an expert CV consultant and career advisor with deep expertise in resume optimization, ATS systems, and modern recruitment practices. Your role is to analyze CVs and provide comprehensive, actionable improvement recommendations.

${generateLanguageInstruction(language)}

### Analysis Framework
Analyze the provided CV across three key dimensions:

1. **Visual Aspect (0-100 score)**: Design, formatting, readability, ATS compatibility
2. **Structural Aspect (0-100 score)**: Organization, flow, section hierarchy, length optimization
3. **Content Enrichment (0-100 score)**: Impact statements, keyword optimization, quantifiable achievements

### Output Requirements
You MUST return ONLY a valid JSON object with this exact structure. Do not include any text before or after the JSON. Ensure all strings are properly quoted and escaped:

{
  "overallScore": number (0-100),
  "overallExplanation": "Brief explanation of overall assessment",
  "visual": {
    "score": number (0-100),
    "explanation": "Assessment of visual presentation",
    "suggestions": [
      {
        "issue": "Specific visual problem identified",
        "fix": "Actionable solution",
        "tools": ["Recommended tools/resources"],
        "priority": "high|medium|low"
      }
    ]
  },
  "structural": {
    "score": number (0-100),
    "explanation": "Assessment of CV structure and organization",
    "suggestions": [
      {
        "issue": "Structural issue identified",
        "fix": "How to improve organization",
        "examples": ["Specific examples"],
        "priority": "high|medium|low"
      }
    ]
  },
  "content": {
    "score": number (0-100),
    "explanation": "Assessment of content quality and relevance",
    "suggestions": [
      {
        "issue": "Content gap or weakness",
        "fix": "How to strengthen content",
        "examples": ["Sample improvements"],
        "priority": "high|medium|low"
      }
    ],
    "missingKeywords": ["Keywords missing from CV"],
    "recommendedKeywords": ["Industry-specific keywords to add"]
  },
  "actionPlan": [
    {
      "step": number,
      "title": "Action item title",
      "description": "Detailed description",
      "estimatedTime": "Time estimate (e.g., '15 min')",
      "tools": ["Recommended tools"]
    }
  ],
  "improvedSamples": [
    {
      "section": "CV section name",
      "before": "Original text example",
      "after": "Improved version",
      "explanation": "Why this improvement works"
    }
  ],
  "resources": [
    {
      "title": "Resource name",
      "url": "https://example.com",
      "description": "What this resource provides",
      "type": "tool|template|guide|article"
    }
  ],
  "analysisDate": "${new Date().toISOString()}",
  "jobTitle": "${jobTitle}",
  "industry": "${industry}"
}

### Analysis Guidelines
- Be encouraging and constructive in tone
- Focus on actionable, specific improvements
- Prioritize ATS optimization and modern CV best practices
- Tailor recommendations to the target job title and industry
- Include quantifiable metrics where possible
- Suggest specific tools and resources
- Ensure privacy-focused approach (no data storage mentioned)
- Provide realistic time estimates for improvements
`;

    const userPrompt = `
Analyze this CV for a ${jobTitle} position in the ${industry} industry:

CV Content:
"""
${cvText}
"""

Target Role: ${jobTitle}
Industry: ${industry}

${generateLanguageInstruction(language)}

Please provide a comprehensive analysis with specific, actionable recommendations to improve this CV's effectiveness for the target role. Focus on:

1. Visual presentation and ATS compatibility
2. Structural organization and flow
3. Content optimization for the target role
4. Missing keywords and industry-specific terms
5. Quantifiable achievements and impact statements

IMPORTANT: All text in the JSON response must be in ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'zh' ? 'Chinese' : 'English'}. Use professional terminology appropriate for the target language and region.

CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no additional text. Start with { and end with }. Ensure all quotes are properly escaped.
`;

    progressCallback?.onProgress?.(25);
    try {
      const rawResponse = await callAIWithFallback(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        modelConfig
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
            visual: { score: 50, explanation: "Analysis incomplete.", suggestions: [] },
            structural: { score: 50, explanation: "Analysis incomplete.", suggestions: [] },
            content: { score: 50, explanation: "Analysis incomplete.", suggestions: [], missingKeywords: [], recommendedKeywords: [] },
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
    modelConfig?: AIModelConfig
  ): Promise<{ html: string }> {
    progressCallback?.onProgress?.(5);
    try {
      const infoCV = type === "text" ? data : await this.getInfoFromFile(data, type, progressCallback);
      if (type === "text") {
        progressCallback?.onInfoProcessed?.();
        progressCallback?.onProgress?.(50);
      }

      let plantillaHTML: string | null = null;
      if (plantilla && typeof plantilla !== "string") {
        plantillaHTML = await this.getPlantillaFromPdf(plantilla);
      } else if (templateId) {
        plantillaHTML = await this.getPlantillaById(templateId, progressCallback);
      } else if (typeof plantilla === "string") {
        plantillaHTML = plantilla;
        progressCallback?.onTemplateProcessed?.();
        progressCallback?.onProgress?.(75);
      } else {
        progressCallback?.onTemplateProcessed?.();
        progressCallback?.onProgress?.(75);
      }

      const ofertaTexto = type === "text" ? data : JSON.stringify(infoCV);
      const cvHtml = await this.generarCVAdaptado(
        ofertaTexto,
        infoCV,
        plantillaHTML || "",
        infoAdicional,
        carrera,
        foto,
        progressCallback,
        language,
        modelConfig
      );

      progressCallback?.onProgress?.(100);
      return { html: cvHtml };
    } catch (error) {
      console.error("Error in crearCV:", error);
      throw error;
    }
  }
}