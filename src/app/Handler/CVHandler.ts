import { OpenAI } from "openai";
import { jsonrepair } from "jsonrepair";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validation_prompt } from "../utils/cv_validations";
import { CVAnalysisResult } from "../types/cv-analysis";


export interface ProgressCallback {
  onProgress?: (progress: number) => void;
  onInfoProcessed?: () => void;
  onTemplateProcessed?: () => void;
}

const API_CONFIG = {
  DEEPSEEK: {
    key: process.env.NEXT_PUBLIC_API_URL_DEESEEK ?? "",
    url: "https://api.deepseek.com",
  },
  GEMINI: {
    key: process.env.NEXT_PUBLIC_API_URL_GEMINIS ?? "",
    model: "gemini-flash-latest",
  },
  GPT: {
    key: process.env.NEXT_PUBLIC_API_GPT_API_KEY ?? "",
    url: "https://api.openai.com/v1",
    model: "gpt-5",
  },
  OPENROUTER: {
    key: process.env.NEXT_PUBLIC_API_OPENROUTER ?? "",
    url: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4.1-mini",
  },
};

const openAIClient = new OpenAI({
  apiKey: API_CONFIG.OPENROUTER.key,
  baseURL: API_CONFIG.OPENROUTER.url,
  dangerouslyAllowBrowser: true, // Consider removing for production
});


const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI.key);
const CSS_FRAMEWORK = "CSS";

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

  async getPlantillaFromPdf(file: File, progressCallback?: ProgressCallback): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: API_CONFIG.GEMINI.model,
      generationConfig: { temperature: 0.3 },
    });

    const prompt = `Generate valid HTML with ${CSS_FRAMEWORK} replicating CV structure:
      - Semantic HTML5 with responsive design
      - Section hierarchy, layout (grid/flex), typography, and spacing
      - Use ${CSS_FRAMEWORK} classes only
      Return ONLY clean HTML code.`;

    progressCallback?.onProgress?.(60);
    try {
      const base64Data = await this.fileToBase64(file);
      progressCallback?.onProgress?.(70);

      const parts = [{ text: prompt }, { inlineData: { mimeType: "application/pdf", data: base64Data } }];
      const { response } = await model.generateContent(parts);
      progressCallback?.onTemplateProcessed?.();
      progressCallback?.onProgress?.(90);

      return this.cleanGeneratedContent(response.text(), "html");
    } catch (error) {
      console.error("Error generating template:", error);
      throw new Error(`Failed to generate template: ${error}`);
    }
  }

  async getPlantillaById(templateId: string, progressCallback?: ProgressCallback): Promise<string> {
    progressCallback?.onProgress?.(60);
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error(`Failed to fetch templates: ${response.statusText}`);

      const { pdfFiles } = await response.json();
      progressCallback?.onProgress?.(70);

      const template = pdfFiles.find((t: any) => t.id.toString() === templateId);
      if (!template) throw new Error(`Template with ID ${templateId} not found`);

      const pdfResponse = await fetch(template.pdfUrl);
      if (!pdfResponse.ok) throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);

      progressCallback?.onProgress?.(80);
      const pdfBlob = await pdfResponse.blob();
      const pdfFile = new File([pdfBlob], template.name, { type: "application/pdf" });

      return this.getPlantillaFromPdf(pdfFile, progressCallback);
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
    language: string = "en"
  ): Promise<string> {
   
    const systemPrompt = `
    You are a senior CV designer and recruiter with deep expertise in crafting visually appealing, professional resumes in HTML using ${CSS_FRAMEWORK}.
    
    Your task is to generate a **single-page CV** perfectly aligned with a specific job offer, based on provided candidate data.
    
    ### 🎯 Output Requirements
    - Produce **clean, semantic, valid HTML5**, ready for PDF or Word export.
    - Write in the **same language as the job offer**, unless the user explicitly requests another language.
    - Design must be **responsive**, minimalist, and elegant, using ${CSS_FRAMEWORK}.
    - Typography: **10–12pt** for body text, **14–16pt** for headings.
    - Margins: **10mm** on all sides.
    - Emphasize skills, experiences, and achievements that **best match the job offer**.
    - Maintain consistent section hierarchy (e.g., Profile, Experience, Education, Skills, Contact Info).
    - Use professional, localized terminology for ${language}.
    - ${
      plantilla
        ? `Base the design and layout on the provided template: ${plantilla}.`
        : "Create a modern, ATS-friendly layout using best UX/UI practices."
    }
    - ${
      foto
        ? `Include the candidate photo (${foto}) if culturally appropriate for the target country.`
        : "Exclude the photo section for a neutral, global presentation."
    }
    - ${
      infoAdicional
        ? `Incorporate the following additional information where relevant: ${infoAdicional}.`
        : "Exclude any additional information not provided."
    }
    - ${
      carrera
        ? `Adapt structure, keywords, and achievements to align with the career field: ${carrera}.`
        : "Use a balanced, cross-industry approach for general applications."
    }
    
    ### ⚙️ Formatting Rules
    - Output **only HTML code** (no Markdown, explanations, or comments).
    - Use inline or embedded ${CSS_FRAMEWORK} styling—avoid external dependencies.
    - Ensure the design looks professional, clean, and export-friendly.
    - The result must feel **human-written**, with natural phrasing and contextual emphasis.
    
    Your goal: produce a **recruiter-ready HTML CV** that stands out visually and contextually.
    `.trim();
    
    const userPrompt = `
    Generate a **one-page HTML CV** using ${CSS_FRAMEWORK}.
    
    Job Offer:
    "${ofertaTexto}"
    
    Candidate Data:
    ${JSON.stringify(infoCV, null, 2)}
    
    ### Guidelines:
    - Tailor the CV to highlight **skills, experiences, and achievements** matching the job offer.
    - Ensure a **responsive, printable layout** that looks great on screen and in PDF.
    - Write in **${language}**, using professional and natural language.
    - ${
      infoAdicional
        ? `Include this additional information where relevant: ${infoAdicional}.`
        : "No additional information."
    }
    - Return **only valid HTML code**, without explanations or Markdown.
    `.trim();
    

    progressCallback?.onProgress?.(85);
    try {
      const response = await openAIClient.chat.completions.create({
        model: API_CONFIG.OPENROUTER.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      if (!response.choices?.[0]?.message?.content) throw new Error("Empty response from model");
      progressCallback?.onProgress?.(95);

      return this.cleanGeneratedContent(response.choices[0].message.content, "html");
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
    language: string = "en"
  ): Promise<CVAnalysisResult> {
    console.log('CVHandler analyzeCV called with language:', language);
    const model = genAI.getGenerativeModel({ 
      model: API_CONFIG.GEMINI.model,
      generationConfig: { 
        temperature: 0.3,
        maxOutputTokens: 4000
      }
    });

    const systemPrompt = `
You are an expert CV consultant and career advisor with deep expertise in resume optimization, ATS systems, and modern recruitment practices. Your role is to analyze CVs and provide comprehensive, actionable improvement recommendations.

### Language Requirements
- Respond in ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'zh' ? 'Chinese' : 'English'}
- All explanations, suggestions, and content must be in the specified language
- Use professional terminology appropriate for the target language and region

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
Language: ${language}

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
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);
      
      progressCallback?.onProgress?.(75);
      console.log("System result:", result);
      const rawResponse = (await result.response).text();
      const responseText = this.cleanGeneratedContent(rawResponse, "json");
      progressCallback?.onProgress?.(90);
      
      // Try to parse JSON with better error handling
      let analysisResult;
      try {
        analysisResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Raw response:", responseText);
        
        // Try to repair JSON using jsonrepair
        try {
          const repairedJson = jsonrepair(responseText);
          analysisResult = JSON.parse(repairedJson);
        } catch (repairError) {
          console.error("JSON repair failed:", repairError);
          
          // Provide a fallback response structure
          const fallbackResponse = {
            overallScore: 50,
            overallExplanation: "Unable to complete full analysis due to response formatting issues.",
            visual: {
              score: 50,
              explanation: "Analysis incomplete - please try again.",
              suggestions: []
            },
            structural: {
              score: 50,
              explanation: "Analysis incomplete - please try again.",
              suggestions: []
            },
            content: {
              score: 50,
              explanation: "Analysis incomplete - please try again.",
              suggestions: [],
              missingKeywords: [],
              recommendedKeywords: []
            },
            actionPlan: [],
            improvedSamples: [],
            resources: [],
            analysisDate: new Date().toISOString(),
            jobTitle: jobTitle,
            industry: industry
          };
          
          console.warn("Using fallback response due to JSON parsing failure");
          return fallbackResponse;
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
    language: string = "en"
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
        plantillaHTML = await this.getPlantillaFromPdf(plantilla, progressCallback);
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
        language
      );

      progressCallback?.onProgress?.(100);
      return { html: cvHtml };
    } catch (error) {
      console.error("Error in crearCV:", error);
      throw error;
    }
  }
}