import { validation_prompt } from "./cv_validations";
import { generateLanguageInstruction } from "./language-helper";

export function buildExtractCVInfoPrompt(fileType: "image" | "pdf"): string {
  return `Extract CV information (${fileType}):\n
      { summary: "", workExperience: [], education: [], skills: [], projects: [], languages: [] }
      Return ONLY a valid JSON object.`;
}

export function buildTemplateFromPdfPrompt(cssFramework: string): string {
  return `Generate valid HTML with ${cssFramework} replicating the CV's visual layout and structure:
      - Use semantic HTML5, responsive layout (grid/flex), consistent spacing, and typography scale
      - Output should contain placeholder text for content (e.g., {{name}}, {{summary}}, {{experience_item}})
      - STRICT: Refrain from introducing any external CSS frameworks or scripts
      - Favor minimal, readable class names derived from the original PDF's visual groupings
      - Keep a single-page layout suitable for A4/PDF export
      - Return ONLY clean HTML code (no Markdown, no explanations).`;
}

export function buildPredominantOfferLanguageInstruction(language: string): string {
  return `
    ### CRITICAL Language Selection Rule
    - Detect the predominant language used in the "Job Offer" text.
    - Generate ALL CV content exclusively in that detected language.
    - If the job offer is mixed-language, use the language with the highest proportion of meaningful content.
    - Only if no clear predominant language can be inferred, use ${language} as fallback.
    `.trim();
}

export function buildGenerateCVSystemPrompt(params: {
  cssFramework: string;
  language: string;
  foto?: string;
  infoAdicional?: string;
  carrera?: string;
}): string {
  const { cssFramework, language, foto = "", infoAdicional = "", carrera = "" } = params;
  const predominantOfferLanguageInstruction = buildPredominantOfferLanguageInstruction(language);

  return `
    You are a senior CV designer and recruiter with deep expertise in crafting visually appealing, professional resumes in HTML using ${cssFramework}.
    
    Your task is to generate a **single-page CV** perfectly aligned with a specific job offer, based on provided candidate data.
    
    ${predominantOfferLanguageInstruction}
    
    ### 🎯 Output Requirements
    - Produce **clean, semantic, valid HTML5**, ready for PDF or Word export.
    - Design must be **responsive**, minimalist, and elegant, using ${cssFramework}.
    - Include all required visual styles inside the returned HTML with a <style> block or inline style attributes.
    - Do not rely on external CSS, Tailwind utility classes, browser defaults, or app-level styles.
    - Any class name used in the HTML must have a matching CSS rule in the returned <style> block.
    - Typography: **10-12pt** for body text, **14-16pt** for headings.
    - Margins: **10mm** on all sides.
    - Emphasize skills, experiences, and achievements that **best match the job offer**.
    - Maintain consistent section hierarchy (e.g., Profile, Experience, Education, Skills, Contact Info).
    - Use professional, localized terminology for the detected predominant language of the job offer.
    - If a template HTML is provided, you MUST:
      1) Preserve the exact structural layout, section order, and container hierarchy
      2) Reuse the same class names and IDs; DO NOT rename classes or add frameworks
      3) Keep the same spacing, grid/flex structure, and typography scales
      4) Replace only the textual content and image sources while keeping elements and wrappers intact
      5) Do not introduce external CSS/JS; only inline or embedded ${cssFramework} styles allowed
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
    - Use inline or embedded ${cssFramework} styling; avoid external dependencies.
    - The HTML must render correctly inside a standalone iframe and in headless Chrome PDF export.
    - Ensure the design looks professional, clean, and export-friendly.
    - The result must feel **human-written**, with natural phrasing and contextual emphasis.
    
    ### 📌 ATS/HR Optimization Guidelines (Translate to the predominant job-offer language and ENFORCE)
    The following expert recommendations must be applied to maximize ATS compatibility and recruiter screening success. Translate all content and headings to the detected predominant language of the job offer and implement the practices within the generated HTML and text content.

    IMPORTANT: For this CV generation task, the predominant language detected in the job offer always takes precedence over any preselected UI language.

    ${validation_prompt}

    Your goal: produce a **recruiter-ready HTML CV** that stands out visually and contextually.
    `.trim();
}

export function buildGenerateCVUserPrompt(params: {
  cssFramework: string;
  ofertaTexto: string;
  infoCV: any;
  language: string;
  plantilla?: string;
  infoAdicional?: string;
}): string {
  const { cssFramework, ofertaTexto, infoCV, language, plantilla = "", infoAdicional = "" } = params;
  const predominantOfferLanguageInstruction = buildPredominantOfferLanguageInstruction(language);

  return `
    Generate a **one-page HTML CV** using ${cssFramework}.
    
    Job Offer:
    "${ofertaTexto}"
    
    Candidate Data:
    ${JSON.stringify(infoCV, null, 2)}
    
    ${predominantOfferLanguageInstruction}
    
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
    ` : ""}
    
    ### Guidelines:
    - Tailor the CV to highlight **skills, experiences, and achievements** matching the job offer.
    - Ensure a **responsive, printable layout** that looks great on screen and in PDF.
    - Include a complete embedded <style> block for spacing, typography, section dividers, and layout.
    - Do not output class-only markup unless every class is defined in the embedded CSS.
    - ${infoAdicional
      ? `Include this additional information where relevant: ${infoAdicional}.`
      : "No additional information."
    }
    - Strictly apply the ATS/HR optimization guidelines provided in the system instructions (translated to the detected predominant language of the job offer)
    - Return **only valid HTML code**, without explanations or Markdown.
    `.trim();
}

export function buildAnalyzeCVSystemPrompt(params: {
  language: string;
  jobTitle: string;
  industry: string;
  analysisDateISO: string;
}): string {
  const { language, jobTitle, industry, analysisDateISO } = params;
  return `
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
  "analysisDate": "${analysisDateISO}",
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
}

export function buildAnalyzeCVUserPrompt(params: {
  cvText: string;
  jobTitle: string;
  industry: string;
  language: string;
}): string {
  const { cvText, jobTitle, industry, language } = params;
  return `
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

IMPORTANT: All text in the JSON response must be in ${language === "en" ? "English" : language === "es" ? "Spanish" : language === "fr" ? "French" : language === "zh" ? "Chinese" : "English"}. Use professional terminology appropriate for the target language and region.

CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no additional text. Start with { and end with }. Ensure all quotes are properly escaped.
`;
}
