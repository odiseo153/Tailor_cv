import { OpenAI } from "openai";
import { jsonrepair } from "jsonrepair";
import { validation_prompt } from "../utils/cv_validations";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAppContext } from "../context/AppContext";



const apiKey = process.env.NEXT_PUBLIC_API_URL_DEESEEK;
const API_KEY_GEMINIS = process.env.NEXT_PUBLIC_API_URL_GEMINIS ?? "";
const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com", dangerouslyAllowBrowser: true });
const estilos = "Tailwind CSS";

const genAI = new GoogleGenerativeAI(API_KEY_GEMINIS);

//https://accounts.google.com/o/oauth2/v2/auth?access_type=online&include_granted_scopes=false&response_type=code&client_id=254835202400-d75p1ad5n2lersu6gsdc81c2oe39ehka.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fuiverse.io%2Fauth%2Fgoogle%2Fcallback&state=c99ab984-7990-4b5b-89ff-410b21fe6546&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email


export class CVHandler {

  async getInfoFromFile(file: File, fileType: 'image' | 'pdf'): Promise<any> {
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

        const fileGoodFormat = await this.fileToBase64(file);

    // Convertir archivo a formato compatible
    const filePart = {
        inlineData: {
            data: fileGoodFormat,
            mimeType: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'
        }
    };

    try {
        const result = await model.generateContent([analysisPrompt, filePart]);
        const response = await result.response;
        
        // Extraer y parsear JSON
        const responseText = response.text();
        const cleanJson = responseText.replace(/```json|```/g, '');
        
        return JSON.parse(cleanJson);
        
    } catch (error) {
        console.error("Error en Gemini:", error);
        return {
            error: "Error procesando el archivo",
            details: error
        };
    }
}

async getPlantillaFromPdf(file: File): Promise<string> {
  const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
          temperature: 0.3 // Más preciso para estructura HTML
      }
  });

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
      
      // Limpiar y validar HTML
      return this.cleanGeneratedHtml(response.text());
      
  } catch (error) {
      throw new Error(`Error generando plantilla: ${error}`);
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
  foto: string = ""
): Promise<string> {
  try {
    const estilos = "Tailwind CSS"; // Default style framework
    const validation_prompt = `
      - Valida que los datos del CV sean relevantes para la oferta.
      - Prioriza experiencia y habilidades que coincidan con las palabras clave de la oferta.
      - Evita incluir información personal sensible (e.g., dirección completa, número de identificación).
      - Asegúrate de que el idioma del CV coincida con el de la oferta.
      - Si no hay suficiente información, genera contenido plausible pero genérico (e.g., "Experiencia en desarrollo de software" si no se proporciona).
    `.trim();

    const systemPrompt = `
      Eres un asistente experto en la creación de CVs profesionales en HTML con ${estilos}.  
      Tu tarea es generar un CV de una sola página, optimizado para la oferta de trabajo proporcionada,  
      utilizando la información del CV del usuario y adaptándolo al contexto.  

      ### Requisitos:
      - **Formato**: HTML semántico, válido y optimizado para conversión a PDF o Word.
      - **Diseño**: Responsivo, limpio y profesional utilizando ${estilos}.
      - **Optimización**: Incluir solo información relevante, eliminando detalles innecesarios.
      - **Estructura**: Diseña para que quepa en una página A4 con márgenes estándar (10mm), usando una tipografía legible (e.g., sans-serif).
      - **Accesibilidad**: Usa etiquetas semánticas (e.g., <header>, <section>) y atributos ARIA si aplica.

      ### Consideraciones:
      ${validation_prompt}

      ${infoAdiccional ? `Incorpora esta información adicional del usuario de manera relevante para el puesto: ${infoAdiccional}.` : ""}
      ${plantilla ? `Utiliza esta plantilla HTML como base (si requiere imagen y no se proporciona una, omite la sección de imagen): ${plantilla}.` : ""}
      ${foto ? `Incluye esta imagen en el CV si la plantilla lo permite: ${foto}.` : ""}

      📌 **IMPORTANTE:** Devuelve únicamente el código HTML limpio, sin texto adicional ni marcadores de lenguaje (e.g., \`'''html\`\`).
    `.trim();

    const userPrompt = `
      Genera un CV en HTML con ${estilos}, adaptado a esta oferta laboral:  
      **${ofertaTexto}**

      Usa la siguiente información del CV del usuario:  
      ${JSON.stringify(infoCV, null, 2)}

      **Instrucciones:**
      - Asegúrate de que el HTML sea válido, bien estructurado y optimizado para exportación a PDF o Word.
      - Adapta el contenido al idioma detectado en la oferta (e.g., español si la oferta está en español).
      - Destaca habilidades y experiencia relevantes para la oferta usando ${estilos} (e.g., negritas, colores sutiles).
      - Si la oferta enfatiza ciertas competencias, priorízalas en el diseño (e.g., "desarrollo web" como sección principal).
    `.trim();

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
  

    return htmlContent;
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


  async crearCV(data: any, type: any, plantilla?: File | string, infoAdicional?: string,foto?:string): Promise<any> {
    try {
      const infoCV = type == 'text' ? data : await this.getInfoFromFile(data, type);
      const plantillaHTML = plantilla ? (typeof plantilla === 'string' ? plantilla : await this.getPlantillaFromPdf(plantilla)) : null;
      const cvAdaptadoHTML = await this.generarCVAdaptado(data, infoCV, plantillaHTML as string, infoAdicional,foto);

      return { html: cvAdaptadoHTML };

    } catch (error: any) {
      console.error("Error en crearCV:", error.message);
      throw error;
    }
  }

  
}

