import { validation_prompt } from "./cv_validations";
import { generateLanguageInstruction } from "./language-helper";

export function buildExtractCVInfoPrompt(fileType: "image" | "pdf"): string {
  return `
You are a CV data extraction specialist. Extract only information that is explicitly visible in the provided ${fileType}.

Return ONLY a valid JSON object with this exact top-level structure:
{
  "summary": "",
  "workExperience": [],
  "education": [],
  "skills": [],
  "projects": [],
  "languages": []
}

Extraction rules:
- Preserve the candidate's original wording where it is clear and useful.
- Do not invent employers, dates, titles, degrees, metrics, links, or skills.
- If a field or section is missing, return an empty string or empty array.
- Keep work experience and education in the same order shown in the CV.
- For experience items, capture role/title, company, location, dates, and achievements/responsibilities when visible.
- For education items, capture degree/program, institution, location, dates, and relevant notes when visible.
- For skills, group related technical tools and competencies when the source CV clearly groups them.
- Return JSON only. No Markdown, comments, explanations, or code fences.
  `.trim();
}

export function buildTemplateFromPdfPrompt(cssFramework: string): string {
  return `
You are an HTML/CSS resume template reconstruction specialist.

Generate valid HTML with embedded ${cssFramework} that recreates the CV's visual layout and structure as a reusable template.

Template requirements:
- Use semantic HTML5 and a complete embedded <style> block.
- Recreate the original visual hierarchy, section order, spacing, typography scale, borders, and alignment as closely as possible.
- Use responsive, print-friendly layout techniques such as grid or flex.
- Use placeholder text for replaceable content, for example {{name}}, {{summary}}, {{experience_item}}, {{education_item}}, {{skills}}.
- Favor minimal, readable class names based on the PDF's visual groupings.
- Keep the layout suitable for single-page A4/PDF export.
- Do not introduce external CSS frameworks, scripts, remote fonts, images, or dependencies.
- Every class used in the HTML must have a matching CSS rule in the embedded <style> block.
- Return ONLY clean HTML code. No Markdown, explanations, comments, or code fences.
  `.trim();
}

export function buildPredominantOfferLanguageInstruction(
  language: string,
): string {
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
  const {
    cssFramework,
    language,
    foto = "",
    infoAdicional = "",
    carrera = "",
  } = params;
  const predominantOfferLanguageInstruction =
    buildPredominantOfferLanguageInstruction(language);

  return `
    You are a senior resume strategist, ATS optimization specialist, recruiter, and HTML/CSS CV designer using ${cssFramework}.

    Your task is to generate a single-page CV aligned with a specific job offer, based strictly on provided candidate data.

    ${predominantOfferLanguageInstruction}

    ### Working Method
    Before writing the final HTML, internally perform these steps without exposing them:
    1) Identify the target role, seniority, hard skills, soft skills, responsibilities, and ATS keywords from the job offer.
    2) Select only candidate evidence that supports those requirements.
    3) Rewrite summaries and bullets using natural, recruiter-ready language in the predominant job-offer language.
    4) Prefer measurable achievements. If the data has no metrics, do not invent numbers.
    5) Balance ATS readability first and visual polish second.

    ### Output Requirements
    - Produce clean, semantic, valid HTML5, ready for PDF or Word export.
    - Design must be responsive, minimalist, elegant, visually polished, and printable using embedded ${cssFramework}.
    - Include all required visual styles inside the returned HTML with a <style> block or inline style attributes.
    - Do not rely on external CSS, Tailwind utility classes, browser defaults, or app-level styles.
    - Any class name used in the HTML must have a matching CSS rule in the returned <style> block.
    - The main CV container must use the full printable area: width: 100%, min-height: 277mm, margin: 0, and box-sizing: border-box.
    - Do not design the CV as a centered card inside the page. Avoid outer borders, page frames, shadows, gray page backgrounds, or decorative wrappers.
    - Typography: 10-12pt for body text, 14-16pt for headings.
    - Margins: 10mm on all sides.
    - The layout must feel intentionally designed, not like plain default HTML. Use strong visual hierarchy, disciplined spacing, and refined alignment.
    - Prefer an editorial resume aesthetic: clean typography, subtle section rhythm, balanced whitespace, and restrained visual accents.
    - Use at most one subdued accent color plus neutrals. Avoid saturated palettes, rainbow sections, loud backgrounds, or excessive visual contrast.
    - Create distinction through layout more than color: vary font weight, spacing, column structure, rules, small caps, label treatment, and grouping.
    - Section headings should feel designed and consistent, using subtle separators, spacing, or typographic treatment rather than heavy decoration.
    - Contact information and key skills should be easy to scan at a glance, using compact layout patterns such as inline groups, chips, meta rows, or side columns when appropriate.
    - Experience entries should have clear hierarchy between role, employer, dates, and achievements, with elegant spacing and alignment.
    - Use subtle dividers, thin rules, muted fills, or soft blocks only when they improve structure. Keep the result sober and professional.
    - Avoid templates that look generic, unfinished, overly colorful, playful, or like a simple text document pasted into HTML.
    - Emphasize skills, experiences, and achievements that best match the job offer.
    - Maintain consistent section hierarchy (e.g., Profile, Experience, Education, Skills, Contact Info).
    - Use professional, localized terminology for the detected predominant language of the job offer.
    - If a template HTML is provided, you MUST:
      1) Preserve the exact structural layout, section order, and container hierarchy
      2) Reuse the same class names and IDs; DO NOT rename classes or add frameworks
      3) Keep the same spacing, grid/flex structure, and typography scales
      4) Replace only the textual content and image sources while keeping elements and wrappers intact
      5) Do not introduce external CSS/JS; only inline or embedded ${cssFramework} styles allowed
    - If no template is provided, create a modern, ATS-friendly layout using best UX/UI practices.
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

    ### Content Rules
    - Do not fabricate experience, employers, education, certifications, languages, links, dates, or metrics.
    - You may improve wording, ordering, emphasis, and keyword alignment based on the candidate data.
    - Convert generic responsibilities into achievement-oriented bullets only when supported by the input.
    - Avoid filler phrases, cliches, exaggerated claims, and keyword stuffing.
    - Keep the CV concise enough to fit one page unless the provided template clearly requires otherwise.

    ### Formatting Rules
    - Output only HTML code (no Markdown, explanations, comments, or code fences).
    - Use inline or embedded ${cssFramework} styling; avoid external dependencies.
    - The HTML must render correctly inside a standalone iframe and in headless Chrome PDF export.
    - Ensure the design looks professional, clean, intentionally styled, and export-friendly.
    - The result must feel human-written, with natural phrasing and contextual emphasis.

    ### ATS/HR Optimization Guidelines
    The following expert recommendations must be applied to maximize ATS compatibility and recruiter screening success. Translate all content and headings to the detected predominant language of the job offer and implement the practices within the generated HTML and text content.

    IMPORTANT: For this CV generation task, the predominant language detected in the job offer always takes precedence over any preselected UI language.

    ${validation_prompt}

    Your goal: produce a recruiter-ready HTML CV that is accurate, targeted, visually clean, and compatible with ATS screening.
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
  const {
    cssFramework,
    ofertaTexto,
    infoCV,
    language,
    plantilla = "",
    infoAdicional = "",
  } = params;
  const predominantOfferLanguageInstruction =
    buildPredominantOfferLanguageInstruction(language);

  return `
    Generate a one-page HTML CV using embedded ${cssFramework}.

    ### Job Offer
    "${ofertaTexto}"

    ### Candidate Data
    ${JSON.stringify(infoCV, null, 2)}

    ${predominantOfferLanguageInstruction}

    ${
      plantilla
        ? `
    ### Template HTML (STRICTLY PRESERVE STRUCTURE & CLASSES)
    """
    ${plantilla}
    """

    CRITICAL Template Rules:
    - Reuse containers, wrappers, and section tags exactly as in the template
    - Keep all class names and IDs unchanged; do not add UI libraries
    - Replace placeholder text and image URLs only; do not alter DOM structure
    - Keep layout (grid/flex) and spacing scales intact
    `
        : ""
    }

    ### Generation Guidelines
    - Tailor the CV to highlight skills, experiences, and achievements matching the job offer.
    - Use only facts supported by Candidate Data or Additional Information.
    - Improve phrasing and relevance, but do not invent metrics, employers, titles, dates, certifications, or tools.
    - Mirror important job-offer terminology naturally where the candidate has matching evidence.
    - Ensure a responsive, printable layout that looks great on screen and in PDF.
    - Include a complete embedded <style> block for spacing, typography, section dividers, and layout.
    - Use the full printable page area. Do not create an inner card with fixed max-width, outer border, shadow, or large vertical padding.
    - Make the resume feel designed and premium through typography, spacing, hierarchy, and alignment, even if the color palette is minimal.
    - Use a restrained palette: neutrals plus a single subtle accent if needed. Avoid bright colors, multicolor sections, gradients, or decorative excess.
    - Prefer elegant structure choices such as a refined two-column header, compact metadata rows, disciplined section spacing, and understated dividers.
    - Make headings, dates, role titles, and company names visually distinct without making the page loud.
    - Use layout and typographic contrast to improve scanability instead of relying on strong fills or large colored blocks.
    - Do not output class-only markup unless every class is defined in the embedded CSS.
    - ${
      infoAdicional
        ? `Include this additional information where relevant: ${infoAdicional}.`
        : "No additional information."
    }
    - Strictly apply the ATS/HR optimization guidelines provided in the system instructions.
    - Return only valid HTML code, without explanations, Markdown, comments, or code fences.
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
You are a senior CV auditor specializing in ATS screening, recruiter review, role targeting, and practical resume improvement. Your role is to analyze CVs and provide specific, evidence-based recommendations.

${generateLanguageInstruction(language)}

### Analysis Framework
Analyze the provided CV across three key dimensions:

1. Visual Aspect (0-100 score): Design, formatting, readability, ATS compatibility
2. Structural Aspect (0-100 score): Organization, flow, section hierarchy, length optimization
3. Content Enrichment (0-100 score): Impact statements, keyword optimization, quantifiable achievements

Scoring rules:
- 90-100: excellent and ready with only minor refinements
- 75-89: strong but missing some targeting, clarity, or polish
- 60-74: usable but requires meaningful improvement
- 40-59: weak for the target role and likely to underperform
- 0-39: incomplete, unclear, or poorly aligned
- overallScore should reflect the combined quality of visual, structural, and content dimensions, with content weighted most heavily

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
- Be direct, constructive, and specific.
- Focus on actionable improvements tied to the target role.
- Prioritize ATS optimization and modern CV best practices.
- Tailor recommendations to the target job title and industry.
- Include quantifiable metrics where possible.
- Do not invent facts about the candidate.
- Do not invent resource URLs. If unsure, use broadly known reputable resources or leave the URL as an empty string.
- Ensure privacy-focused approach; do not mention data storage.
- Provide realistic time estimates for improvements.
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

Provide a comprehensive analysis with specific, actionable recommendations to improve this CV's effectiveness for the target role. Focus on:

1. Visual presentation and ATS compatibility
2. Structural organization and flow
3. Content optimization for the target role
4. Missing keywords and industry-specific terms
5. Quantifiable achievements and impact statements

Important:
- Base recommendations only on the CV content provided.
- If information is missing, identify the gap instead of assuming details.
- Keep examples realistic and aligned with the target role.

IMPORTANT: All text in the JSON response must be in ${
    language === "en"
      ? "English"
      : language === "es"
        ? "Spanish"
        : language === "fr"
          ? "French"
          : language === "zh"
            ? "Chinese"
            : "English"
  }. Use professional terminology appropriate for the target language and region.

CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no additional text. Start with { and end with }. Ensure all quotes are properly escaped.
`;
}
