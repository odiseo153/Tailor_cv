import { OpenAI } from "openai";
import { jsonrepair } from "jsonrepair";
import { validation_prompt } from "../utils/cv_validations";
import { useAppContext } from "../layout/AppContext";

const apiKey = process.env.NEXT_PUBLIC_API_URL_DEESEEK;
const API_KEY_GEMINIS = process.env.NEXT_PUBLIC_API_URL_GEMINIS;
const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com",dangerouslyAllowBrowser:true });
const estilos = "tailwind";


export class CVHandler {

  async getInfoFromFile(fileContentBase64: string, fileType: 'image' | 'pdf'): Promise<any> {
    const URL: string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY_GEMINIS}`;

    try {
      const analysisPrompt: string = `
        Eres un asistente especializado en analizar informacion para crear currículums vitae (CVs). Analiza el contenido proporcionado, que puede ser texto extraído de un PDF o el contenido de una imagen de un CV, y extrae la siguiente información relevante para un CV:

        2. **Resumen o Perfil Profesional:**  Un breve párrafo que resume la experiencia y objetivos del candidato.
        3. **Experiencia Laboral:**  Lista de puestos de trabajo anteriores, incluyendo nombre de la empresa, puesto, fechas de inicio y fin, y descripción de responsabilidades y logros.
        4. **Educación:**  Títulos académicos, instituciones educativas, fechas de inicio y fin, y detalles relevantes como especializaciones o logros académicos.
        5. **Habilidades:**  Lista de habilidades técnicas y blandas relevantes para el perfil profesional.
        6. **Proyectos (opcional):**  Descripción de proyectos personales o profesionales relevantes que demuestren habilidades y experiencia.
        7. **Idiomas (opcional):**  Idiomas que domina y su nivel.

        Devuelve la información extraída en formato JSON válido. Si alguna sección no está presente en el CV o no se puede extraer, omite esa sección del JSON o devuelve un valor nulo o un array vacío según corresponda.  Asegúrate de que el JSON sea siempre válido y fácil de parsear.
        `;

      let mimeType = 'image/jpeg'; // Default to image, adjust if fileType is pdf
      if (fileType === 'pdf') {
        mimeType = 'application/pdf'; // Or 'text/plain' if sending extracted text as text part
      }


      const payload = {
        contents: [{
          role: "user",
          parts: [
            { text: analysisPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: fileContentBase64
              }
            }
          ]
        }]
      };

      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const responseText = responseData.candidates[0].content.parts[0].text;

      const cleanedResponse = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        return JSON.parse(cleanedResponse);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        console.error("Raw response text:", cleanedResponse);
        return {
          error: "Error al parsear la respuesta JSON de Gemini.",
          rawResponse: cleanedResponse
        };
      }


    } catch (error: unknown) {
      let errorMessage = 'Error desconocido al procesar el archivo del CV';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        error: errorMessage
      };
    }
  }

  async getPlantilla(fileContentBase64: string, fileType: 'image' | 'pdf'): Promise<any> {
    const URL: string = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY_GEMINIS}`;

    try {
      const analysisPrompt: string = `
        Eres un experto en diseño web y análisis de currículums vitae (CVs). Tu tarea es analizar la imagen o PDF de un CV que se te proporciona y generar código HTML con ${estilos} que represente visualmente el CV de la manera más fiel posible.

        Analiza la estructura y el contenido del CV, incluyendo:

        - Secciones principales (Información Personal, Resumen, Experiencia Laboral, Educación, Habilidades, etc.)
        - Jerarquía de títulos y subtítulos
        - Estilo de texto (fuente, tamaño, negrita, etc.)
        - Diseño general y disposición de los elementos

        Genera el HTML utilizando clases de ${estilos} para el estilo.  Intenta replicar el diseño original del CV lo más fielmente posible usando ${estilos}.  Devuelve **únicamente el código HTML**, sin texto adicional ni explicaciones.  Si no puedes replicar un aspecto específico del diseño, prioriza la representación clara y legible del contenido del CV.  Asegúrate de que el HTML sea válido y bien estructurado.
        `;

      let mimeType = 'image/jpeg'; // Default to image, adjust if fileType is pdf
      if (fileType === 'pdf') {
        mimeType = 'application/pdf';
      }

      const payload = {
        contents: [{
          role: "user",
          parts: [
            { text: analysisPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: fileContentBase64
              }
            }
          ]
        }]
      };

      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const responseHTML = responseData.candidates[0].content.parts[0].text;

      return responseHTML;

    } catch (error: unknown) {
      let errorMessage = 'Error desconocido al procesar el archivo del CV y generar HTML';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        error: errorMessage
      };
    }
  }

  async extraerInfoCV(textoCV: string): Promise<any> {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
          {
            role: "system",
            content: `Eres un asistente experto en extraer información de currículums (CVs) y devolverla en formato JSON.  Analiza el CV y extrae la siguiente información en JSON.  Si una sección no está presente, omítela o usa un array vacío si es una lista.  No incluyas texto adicional fuera del JSON.

**Estructura JSON esperada:**

\`\`\`json
{
  "informacion_personal": {
    "nombre_completo": "...",
    "email": "...",
    "telefono": "...",
    "linkedin": "...",
    "direccion": "..."
  },
  "resumen_profesional": "...",
  "experiencia_laboral": [
    {
      "puesto": "...",
      "empresa": "...",
      "fecha_inicio": "...",
      "fecha_fin": "...",
      "descripcion_tareas": "..."
    },
    { ... }
  ],
  "educacion": [
    {
      "titulo": "...",
      "institucion": "...",
      "fecha_inicio": "...",
      "fecha_fin": "...",
      "descripcion_educacion": "..."
    },
    { ... }
  ],
  "habilidades": ["...", "..."],
  "proyectos": [
    {
      "nombre_proyecto": "...",
      "descripcion_proyecto": "...",
      "tecnologias_utilizadas": ["...", "..."]
    },
    { ... }
  ]
}
\`\`\`
`,
},
{
  role: "user",
  content: `Extrae la información del siguiente CV en formato JSON, solo en formato JSON: ${textoCV}`,
},
],
stream: false,
});

if (!response.choices?.[0]?.message?.content) {
  throw new Error("Deepseek devolvió una respuesta vacía o incorrecta.");
}

let jsonResponse: string = response.choices[0].message.content.trim();
console.log(response)
try {
      return this.sanitizeJSONResponse(jsonResponse);
    } catch (error: any) { // error: any
      console.error(`Error al extraer información del CV: ${error.message}`);
      throw error;
    }
  }

  async generarCVAdaptado(
    ofertaTexto: string,
    infoCV: any,
    plantilla?: string,
    infoAdiccional?: string
  ): Promise<string> {
    console.log(infoAdiccional);
  
    try {
 
  
      const systemPrompt = `
        Eres un asistente experto en la creación de CVs profesionales en **HTML con ${estilos}**.  
        Tu tarea es generar un **CV de una sola página**, optimizado para la oferta de trabajo proporcionada,  
        utilizando la información del CV del usuario.  
  
        ### Requisitos:
        - **Formato**: **HTML semántico**, válido y listo para conversión a PDF.  
        - **Diseño**: **Responsivo y profesional** con ${estilos}.  
        - **Optimización**: Solo información relevante, evitando detalles innecesarios.  
        - **Estructura**: Quepa en **una página A4**, bien organizada.  
  
        ### Consideraciones:
        ${validation_prompt}
  
        ${infoAdiccional ? `Toma en cuenta esta información adicional del usuario, pon en el cv la info del usuario relevante para el puesto: ${infoAdiccional}.` : ""}
        
        📌 **IMPORTANTE:** Devuelve únicamente el código HTML sin ningún otro texto adicional ni etiquetas de lenguaje como \`'''html'''\`.
      `.trim();
  
      const userPrompt = `
        Genera un CV en **HTML con ${estilos}**, adaptado a esta oferta laboral:  
        **${ofertaTexto}**  
  
        Usa la siguiente información del CV del usuario:  
        ${JSON.stringify(infoCV)}  
  
        **Asegúrate de que el HTML sea válido, estructurado y listo para conversión a PDF.**
      `.trim();
  
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      });
  
      if (!response.choices?.[0]?.message?.content) {
        throw new Error("Deepseek devolvió una respuesta vacía o incorrecta.");
      }
  
      return response.choices[0].message.content.trim();
    } catch (error: any) {
      console.error(`❌ Error al generar el CV: ${error.message}`);
      throw error;
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

 

  async crearCV(data: any, type: any, plantilla?: File, infoAdicional?: string): Promise<{ html: string }> {
    try {
      const infoCV = type == 'text' ? await this.extraerInfoCV(data) : await this.getInfoFromFile(data, type);
      const plantillaHTML = type != 'text' ? await this.getPlantilla(data, type) : null;
      const cvAdaptadoHTML = await this.generarCVAdaptado(data, infoCV, plantillaHTML as string, infoAdicional);

      return { html: cvAdaptadoHTML };

    } catch (error: any) {
      console.error("Error en crearCV:", error.message);
      throw error;
    }
  }
}

