import { OpenAI } from "openai";
import { jsonrepair } from "jsonrepair";
import { validation_prompt } from "../utils/cv_validations";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAppContext } from "../context/AppContext";

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

    // Configurar el prompt
    const analysisPrompt = `Extrae información de CV (${fileType}):\n
        * Resumen o Perfil Profesional\n
        * Experiencia Laboral\n
        * Educación\n
        * Habilidades\n
        * Proyectos (opcional)\n
        * Idiomas (opcional)\n\n
        Devuelve SOLO un objeto JSON válido, sin markdown ni texto adicional.`;

    // Notify progress - start processing info
    progressCallback?.onProgress?.(10); // 10% progress when starting

    const fileGoodFormat = await this.fileToBase64(file);

    // Convertir archivo a formato compatible
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
        
        // Extraer y parsear JSON
        const responseText = response.text();
        const cleanJson = responseText.replace(/```json|```/g, '');
        
        // Mark info processing as complete
        progressCallback?.onInfoProcessed?.();
        progressCallback?.onProgress?.(50); // 50% when info is processed
        
        return JSON.parse(cleanJson);
        
    } catch (error) {
        console.error("Error en Gemini:", error);
        return {
            error: "Error procesando el archivo",
            details: error
        };
    }
}

async getPlantillaFromPdf(file: File, progressCallback?: ProgressCallback): Promise<string> {
  const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
          temperature: 0.3 // Más preciso para estructura HTML
      }
  });

  progressCallback?.onProgress?.(60); // 60% when starting template processing

  const prompt = `Analiza este CV y genera código HTML válido con ${estilos} que replique fielmente:
      - Jerarquía de secciones
      - Layout (grid/flex)
      - Tipografía y espaciado
      - Elementos visuales clave
      - Estilos específicos
      
      Reglas:
      * Usa clases CSS de "${estilos}" exclusivamente
      * HTML5 semántico y válido
      * Responsive design básico
      * SIN comentarios ni texto adicional`;

  try {
      // Convertir File a base64 (versión browser)
      const base64Data = await this.fileToBase64(file);
      
      progressCallback?.onProgress?.(70); // 70% after file conversion
      
      // Construir partes del mensaje
      const parts = [
          { text: prompt },
          {
              inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Data
              }
          }
      ];

      // Generar contenido
      const { response } = await model.generateContent(parts);
      
      progressCallback?.onProgress?.(90); // 90% after getting response
      
      // Mark template processing as complete
      progressCallback?.onTemplateProcessed?.();
      
      // Limpiar y validar HTML
      return this.cleanGeneratedHtml(response.text());
      
  } catch (error) {
      throw new Error(`Error generando plantilla: ${error}`);
  }
}

// Nuevo método para obtener la plantilla desde la API por ID
async getPlantillaById(templateId: string, progressCallback?: ProgressCallback): Promise<string> {
  try {
    progressCallback?.onProgress?.(60); // 60% when starting template processing
  
    // Primero obtenemos la información sobre las plantillas
    const response = await fetch("/api/templates");
    if (!response.ok) {
      throw new Error(`Error fetching templates: ${response.statusText}`);
    }
    
    const data = await response.json();
    progressCallback?.onProgress?.(70); // 70% after getting template data
    
    // Buscamos la plantilla por ID
    const selectedTemplate = data.pdfFiles.find(
      (template: any) => template.id.toString() === templateId
    );
    
    if (!selectedTemplate) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Ahora obtenemos el contenido de la plantilla desde la URL
    const pdfResponse = await fetch(selectedTemplate.pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Error fetching PDF template: ${pdfResponse.statusText}`);
    }
    
    progressCallback?.onProgress?.(80); // 80% after fetching PDF
    
    // Convertimos el PDF a blob
    const pdfBlob = await pdfResponse.blob();
    
    // Convertimos el blob a File para usar el método existente
    const pdfFile = new File([pdfBlob], selectedTemplate.name, { type: 'application/pdf' });
    
    // Usamos el método existente para obtener la plantilla HTML, pero sin duplicar las actualizaciones de progreso
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
  progressCallback?: ProgressCallback
): Promise<string> {
  try {
    const estilos = "Tailwind CSS"; // Default style framework
    
    // Notify progress - start generating adaptado
    progressCallback?.onProgress?.(75); // 75% when starting final CV generation
    
    const systemPrompt = `
    Eres un asistente especializado en la creación de CVs profesionales en HTML con ${estilos}.  
    Tu objetivo es generar un CV de una sola página, optimizado para la oferta de trabajo proporcionada, utilizando la información del CV del usuario y adaptándola al contexto laboral.
  
    ### Requisitos:
    - **Formato**: Genera HTML semántico, válido y optimizado para exportación a PDF o Word, asegurando compatibilidad con herramientas de conversión estándar.
    - **Diseño**: Crea un diseño responsivo, limpio y profesional utilizando ${estilos}, con un enfoque en la legibilidad y estética moderna.
    - **Optimización**: Incluye solo información relevante para la oferta, eliminando detalles innecesarios y priorizando logros cuantificables y habilidades clave.
    - **Estructura**: Diseña el CV para que quepa en una página A4 con márgenes estándar (10mm), utilizando una tipografía legible (e.g., Arial, Helvetica, o similar sans-serif) y un tamaño de fuente adecuado (10-12pt para texto, 14-16pt para encabezados).
    - **Accesibilidad**: Usa etiquetas HTML semánticas (e.g., <header>, <section>, <article>) y atributos ARIA cuando sea necesario para mejorar la compatibilidad con lectores de pantalla.
  
    ### Consideraciones:
    - ${validation_prompt}
    - ${infoAdiccional ? `Incorpora la siguiente información adicional del usuario de manera relevante y estratégica para el puesto: ${infoAdiccional}.` : "No se proporcionó información adicional."}
    - ${carrera ? `Adapta el CV a la carrera del usuario (${carrera}), siguiendo las mejores prácticas y estándares de la industria para destacar habilidades y experiencias relevantes.` : "Si no se especifica una carrera, asume un enfoque generalista basado en la oferta laboral."}
    - ${plantilla ? `Utiliza esta plantilla HTML como base: ${plantilla}. Si la plantilla incluye una sección para imagen y no se proporciona una, omite dicha sección.` : "Si no se proporciona una plantilla, crea una estructura HTML moderna y profesional desde cero."}
    - ${foto ? `Incluye la imagen proporcionada (${foto}) en el CV si la plantilla lo permite y es culturalmente apropiado para el contexto de la oferta.` : "Omite cualquier sección de imagen si no se proporciona una foto o si no es relevante para la oferta."}
  
    📌 **IMPORTANTE:** Devuelve únicamente el código HTML limpio, sin comentarios, texto explicativo ni marcadores de lenguaje (e.g., \`\`\`html\`\`\`). Asegúrate de que el código sea funcional y esté listo para renderizarse correctamente.
  `.trim();

  const userPrompt = `
  Genera un CV profesional en HTML con ${estilos}, adaptado específicamente a la siguiente oferta laboral:  
  **${ofertaTexto}**

  Utiliza la siguiente información del CV del usuario:  
  ${JSON.stringify(infoCV, null, 2)}

  ### Instrucciones:
  - Genera un HTML válido, semántico y optimizado para exportación a PDF o Word, asegurando que el diseño sea consistente en diferentes dispositivos y plataformas.
  - Adapta el idioma del CV al de la oferta laboral (e.g., español si la oferta está en español) y usa un tono profesional acorde con la industria.
  - Destaca habilidades, experiencias y logros relevantes para la oferta, utilizando ${estilos} para resaltar elementos clave (e.g., negritas para palabras clave, colores sutiles para secciones).
  - Prioriza las competencias y requisitos mencionados en la oferta (e.g., si se enfatiza 'desarrollo web', coloca esta sección al inicio o resáltala visualmente).
  - Si la oferta especifica certificaciones, proyectos o herramientas, intégralos de manera prominente en el diseño, asegurándote de alinearlos con la información del usuario.
  - Evita información redundante o irrelevante, manteniendo el CV conciso y enfocado en una sola página.

  📌 **IMPORTANTE:** Devuelve únicamente el código HTML limpio, sin texto adicional, comentarios o marcadores de lenguaje (e.g., \`\`\`html\`\`\`).
`.trim();

    progressCallback?.onProgress?.(85); // 85% before making the API call
    
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: false,
      temperature: 0.7, // Ajuste para mayor consistencia
      max_tokens: 2000, // Límite razonable para un CV de una página
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("El modelo devolvió una respuesta vacía o incorrecta.");
    }

    const htmlContent = response.choices[0].message.content.trim();
    
    // Final progress update - CV is complete
    progressCallback?.onProgress?.(95); // 95% when CV is generated
  

    return htmlContent
    .replace('```html','')
    .replace('```','');
  } catch (error: any) {
    console.error(`❌ Error al generar el CV: ${error.message}`);
    throw new Error(`Fallo en la generación del CV: ${error.message}`);
  }
}

  async sanitizeJSONResponse(responseText: string): Promise<any> {
    try {
      responseText = responseText.replace(/```json|```/g, "").trim();
      const repairedJSON: string = jsonrepair(responseText);
      return JSON.parse(repairedJSON);
    } catch (error: any) { // error: any
      console.error("Error procesando JSON:", error);
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
     progressCallback?: ProgressCallback
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
      
      // Lógica para determinar qué plantilla usar
      let plantillaHTML: string | null = null;
      
      // Prioridad 1: Plantilla archivo enviado manualmente
      if (plantilla && typeof plantilla !== 'string') {
        plantillaHTML = await this.getPlantillaFromPdf(plantilla, progressCallback);
      } 
      // Prioridad 2: Plantilla por ID
      /*
      else if (templateId) {
        plantillaHTML = await this.getPlantillaById(templateId, progressCallback);
      }
      */
      // Prioridad 3: Plantilla como string (legado)
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
      
      const cvAdaptadoHTML = await this.generarCVAdaptado(
        data, 
        infoCV, 
        plantillaHTML as string, 
        infoAdicional, 
        carrera, 
        foto,
        progressCallback
      );

      // Complete the process - 100%
      progressCallback?.onProgress?.(100);
      
      return { html: cvAdaptadoHTML };

    } catch (error: any) {
      console.error("Error en crearCV:", error.message);
      throw error;
    }
  }

  
}

