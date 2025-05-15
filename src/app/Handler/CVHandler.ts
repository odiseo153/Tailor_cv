import { OpenAI } from "openai";
import { jsonrepair } from "jsonrepair";
import { validation_prompt } from "../utils/cv_validations";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Add interface for progress tracking
export interface ProgressCallback {
  onInfoProcessed?: () => void;
  onTemplateProcessed?: () => void;
  onProgress?: (progress: number) => void;
}

const apiKey = process.env.NEXT_PUBLIC_API_URL_DEESEEK;
const API_KEY_GEMINIS = process.env.NEXT_PUBLIC_API_URL_GEMINIS ?? "";
const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com", dangerouslyAllowBrowser: true });
const estilos = "Tailwind CSS";

const genAI = new GoogleGenerativeAI(API_KEY_GEMINIS);

//https://accounts.google.com/o/oauth2/v2/auth?access_type=online&include_granted_scopes=false&response_type=code&client_id=254835202400-d75p1ad5n2lersu6gsdc81c2oe39ehka.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fuiverse.io%2Fauth%2Fgoogle%2Fcallback&state=c99ab984-7990-4b5b-89ff-410b21fe6546&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email


export class CVHandler {

  async getInfoFromFile(file: File, fileType: 'image' | 'pdf', progressCallback?: ProgressCallback): Promise<any> {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
    });

    // Configure the prompt in English
    const analysisPrompt = `Extract information from CV (${fileType}):\n
        * Summary or Professional Profile\n
        * Work Experience\n
        * Education\n
        * Skills\n
        * Projects (optional)\n
        * Languages (optional)\n\n
        Return ONLY a valid JSON object, without markdown or additional text.`;

    // Notify progress - start processing info
    progressCallback?.onProgress?.(10); // 10% progress when starting

    const fileGoodFormat = await this.fileToBase64(file);

    // Convert file to compatible format
    const filePart = {
        inlineData: {
            data: fileGoodFormat,
            mimeType: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'
        }
    };

    progressCallback?.onProgress?.(25); // 25% after file preparation

    try {
        const result = await model.generateContent([analysisPrompt, filePart]);
        const response = await result.response;
        
        // Extract and parse JSON
        const responseText = response.text();
        const cleanJson = responseText.replace(/```json|```/g, '');
        
        // Mark info processing as complete
        progressCallback?.onInfoProcessed?.();
        progressCallback?.onProgress?.(50); // 50% when info is processed
        
        return JSON.parse(cleanJson);
        
    } catch (error) {
        console.error("Error in Gemini:", error);
        return {
            error: "Error processing the file",
            details: error
        };
    }
}

async getPlantillaFromPdf(file: File, progressCallback?: ProgressCallback): Promise<string> {
  const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
          temperature: 0.3 // More precise for HTML structure
      }
  });

  progressCallback?.onProgress?.(60); // 60% when starting template processing

  const prompt = `Analyze this CV and generate valid HTML code with ${estilos} that faithfully replicates:
      - Section hierarchy
      - Layout (grid/flex)
      - Typography and spacing
      - Key visual elements
      - Specific styles
      
      Rules:
      * Use CSS classes from "${estilos}" exclusively
      * Semantic and valid HTML5
      * Basic responsive design
      * NO comments or additional text`;

  try {
      // Convert File to base64 (browser version)
      const base64Data = await this.fileToBase64(file);
      
      progressCallback?.onProgress?.(70); // 70% after file conversion
      
      // Build message parts
      const parts = [
          { text: prompt },
          {
              inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Data
              }
          }
      ];

      // Generate content
      const { response } = await model.generateContent(parts);
      
      progressCallback?.onProgress?.(90); // 90% after getting response
      
      // Mark template processing as complete
      progressCallback?.onTemplateProcessed?.();
      
      // Clean and validate HTML
      return this.cleanGeneratedHtml(response.text());
      
  } catch (error) {
      throw new Error(`Error generating template: ${error}`);
  }
}

// Method to get template by ID
async getPlantillaById(templateId: string, progressCallback?: ProgressCallback): Promise<string> {
  try {
    progressCallback?.onProgress?.(60); // 60% when starting template processing
  
    // First get information about templates
    const response = await fetch("/api/templates");
    if (!response.ok) {
      throw new Error(`Error fetching templates: ${response.statusText}`);
    }
    
    const data = await response.json();
    progressCallback?.onProgress?.(70); // 70% after getting template data
    
    // Find template by ID
    const selectedTemplate = data.pdfFiles.find(
      (template: any) => template.id.toString() === templateId
    );
    
    if (!selectedTemplate) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Get template content from URL
    const pdfResponse = await fetch(selectedTemplate.pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Error fetching PDF template: ${pdfResponse.statusText}`);
    }
    
    progressCallback?.onProgress?.(80); // 80% after fetching PDF
    
    // Convert PDF to blob
    const pdfBlob = await pdfResponse.blob();
    
    // Convert blob to File to use existing method
    const pdfFile = new File([pdfBlob], selectedTemplate.name, { type: 'application/pdf' });
    
    // Use existing method to get HTML template, without duplicating progress updates
    const result = await this.getPlantillaFromPdf(pdfFile);
    
    // Mark template processing as complete
    progressCallback?.onTemplateProcessed?.();
    progressCallback?.onProgress?.(90); // 90% after processing
    
    return result;
  } catch (error) {
    console.error("Error getting template by ID:", error);
    throw error;
  }
}

// Helpers
private async fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
}

private cleanGeneratedHtml(rawHtml: string): string {
  return rawHtml
      .replace(/```html|```/g, '')
      .trim()
      .replace(/\n{3,}/g, '\n\n');
}
 


async generarCVAdaptado(
  ofertaTexto: string,
  infoCV: any,
  plantilla: string = "",
  infoAdiccional: string = "",
  carrera: string = "",
  foto: string = "",
  progressCallback?: ProgressCallback,
  language: string = "en"
): Promise<string> {
  try {
    const estilos = "Tailwind CSS"; // Default style framework
   
    progressCallback?.onProgress?.(75); // 75% when starting final CV generation
 
    const systemPrompt = `
    You are a specialized assistant in creating professional CVs in HTML with ${estilos}.  
    Your goal is to generate a one-page CV, optimized for the provided job offer, using the user's CV information and adapting it to the job context.
  
    ### Requirements:
    - **Format**: Generate semantic, valid HTML optimized for export to PDF or Word, ensuring compatibility with standard conversion tools.
    - **Design**: Create a responsive, clean, and professional design using ${estilos}, with a focus on readability and modern aesthetics.
    - **Optimization**: Include only information relevant to the offer, eliminating unnecessary details and prioritizing quantifiable achievements and key skills.
    - **Structure**: Design the CV to fit on one A4 page with standard margins (10mm), using a readable font (e.g., Arial, Helvetica, or similar sans-serif) and an appropriate font size (10-12pt for text, 14-16pt for headings).
    - **Accessibility**: Use semantic HTML tags (e.g., <header>, <section>, <article>) and ARIA attributes when necessary to improve compatibility with screen readers.
    - **Language**: The CV MUST be written in ${language}. Translate all content appropriately for this language while maintaining professional terminology.
  
    ### Considerations:
    - ${validation_prompt}
    - ${infoAdiccional ? `Incorporate the following additional user information in a relevant and strategic way for the position: ${infoAdiccional}.` : "No additional information provided."}
    - ${carrera ? `Adapt the CV to the user's career (${carrera}), following best practices and industry standards to highlight relevant skills and experiences.` : "If no career is specified, assume a generalist approach based on the job offer."}
    - ${plantilla ? `Use this HTML template as a base: ${plantilla}. If the template includes a section for an image and one is not provided, omit that section.` : "If no template is provided, create a modern and professional HTML structure from scratch."}
    - ${foto ? `Include the provided image (${foto}) in the CV if the template allows it and it is culturally appropriate for the context of the offer.` : "Omit any image section if no photo is provided or if it is not relevant to the offer."}
  
    📌 **IMPORTANT:** Return only clean HTML code, without comments, explanatory text, or language markers (e.g., \`\`\`html\`\`\`). Make sure the code is functional and ready to render correctly.
  `.trim();

  const userPrompt = `
  Generate a professional CV in HTML with ${estilos}, specifically adapted to the following job offer:  
  **${ofertaTexto}**

  Use the following information from the user's CV:  
  ${infoAdiccional ? 
  `I want you to generate a professional CV for the currently logged-in user using the following JSON data structure. 
  Consider the personal information, work experience, skills, education, social links, and CV preferences.
  The result should be a well-organized, visually appealing document, 
  using the style defined by the user in cvPreferences (colors, font, page size, etc.). 
  Make sure the writing is professional, concise, and appropriate for applying to software development positions.
  Don't omit important details of work experience,
  and keep texts clear and well-structured to highlight the user's profile. Here is the info: \n ${infoAdiccional}`
  : "No additional user information provided."}


  ### Instructions:
  - Generate valid, semantic HTML optimized for export to PDF or Word, ensuring the design is consistent across different devices and platforms.
  - The CV MUST be written in ${language}. Adapt all content to this language while maintaining professional terminology and appropriate tone.
  - Highlight relevant skills, experiences, and achievements for the offer, using ${estilos} to highlight key elements (e.g., bold for keywords, subtle colors for sections).
  - Prioritize competencies and requirements mentioned in the offer (e.g., if 'web development' is emphasized, place this section at the beginning or highlight it visually).
  - If the offer specifies certifications, projects, or tools, integrate them prominently in the design, making sure to align them with the user's information.
  - Avoid redundant or irrelevant information, keeping the CV concise and focused on a single page.

  📌 **IMPORTANT:** Return only clean HTML code, without additional text, comments, or language markers (e.g., \`\`\`html\`\`\`).
`.trim();

    progressCallback?.onProgress?.(85); // 85% before making the API call
    
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: false,
      temperature: 0.7, // Adjustment for greater consistency
      max_tokens: 2000, // Reasonable limit for a one-page CV
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("The model returned an empty or incorrect response.");
    }

    const htmlContent = response.choices[0].message.content.trim();
    
    // Final progress update - CV is complete
    progressCallback?.onProgress?.(95); // 95% when CV is generated
  

    return htmlContent
    .replace('```html','')
    .replace('```','');
  } catch (error: any) {
    console.error(`❌ Error generating CV: ${error.message}`);
    throw new Error(`CV generation failed: ${error.message}`);
  }
}

  async sanitizeJSONResponse(responseText: string): Promise<any> {
    try {
      responseText = responseText.replace(/```json|```/g, "").trim();
      const repairedJSON: string = jsonrepair(responseText);
      return JSON.parse(repairedJSON);
    } catch (error: any) { // error: any
      console.error("Error processing JSON:", error);
      return {};
    }
  }


  async crearCV(
    data: any,
     type: any, 
     plantilla?: File | string,
     infoAdicional?: string,
     carrera?: string,
     foto?:string,
     templateId?: string,
     progressCallback?: ProgressCallback,
     language: string = "en"
    ): Promise<any> {
    try {
      // Initialize progress - starting the entire process
      progressCallback?.onProgress?.(5); // 5% when starting
      
      // Process CV info based on type
      const infoCV = type === 'text' 
        ? data 
        : await this.getInfoFromFile(data, type, progressCallback);
      
      // Info processing complete
      if (type === 'text') {
        progressCallback?.onInfoProcessed?.();
        progressCallback?.onProgress?.(50); // 50% for text-based input
      }
      
      // Logic to determine which template to use
      let plantillaHTML: string | null = null;
      
      // Priority 1: Template file sent manually
      if (plantilla && typeof plantilla !== 'string') {
        plantillaHTML = await this.getPlantillaFromPdf(plantilla, progressCallback);
      } 
      // Priority 2: Template by ID
      /*
      else if (templateId) {
        plantillaHTML = await this.getPlantillaById(templateId, progressCallback);
      }
      */
      // Priority 3: Template as string (legacy)
      else if (plantilla && typeof plantilla === 'string') {
        plantillaHTML = plantilla;
        // For string-based templates, mark as processed immediately
        progressCallback?.onTemplateProcessed?.();
        progressCallback?.onProgress?.(75);
      } else {
        // No custom template used
        progressCallback?.onTemplateProcessed?.();
        progressCallback?.onProgress?.(75);
      }
      
      // For text-type offers, we use 'data' as the offer text
      // For file-type offers, we use 'infoCV' which contains the information extracted from the file
      const ofertaTexto = type === 'text' ? data : JSON.stringify(infoCV);
      
      const cvAdaptadoHTML = await this.generarCVAdaptado(
        ofertaTexto, 
        infoCV, 
        plantillaHTML as string, 
        infoAdicional, 
        carrera, 
        foto,
        progressCallback,
        language
      );

      // Complete the process - 100%
      progressCallback?.onProgress?.(100);
      
      return { html: cvAdaptadoHTML };

    } catch (error: any) {
      console.error("Error in crearCV:", error.message);
      throw error;
    }
  }

  
}

