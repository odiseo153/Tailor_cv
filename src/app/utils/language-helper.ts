/**
 * Language helper utilities for AI content generation
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  aiPromptName: string;
  culturalContext: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    aiPromptName: 'English',
    culturalContext: 'Use international business English standards with clear, professional terminology.'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    aiPromptName: 'Spanish (Español)',
    culturalContext: 'Use formal business Spanish with appropriate regional terminology. Maintain professional tone suitable for Latin American and Spanish markets.'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    aiPromptName: 'French (Français)',
    culturalContext: 'Use professional French business vocabulary with appropriate formality levels for French and Francophone markets.'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    aiPromptName: 'Chinese (中文)',
    culturalContext: 'Use simplified Chinese characters with professional terminology appropriate for mainland Chinese business contexts.'
  }
};

/**
 * Get language configuration for AI prompts
 */
export function getLanguageConfig(languageCode: string): LanguageConfig {
  return SUPPORTED_LANGUAGES[languageCode] || SUPPORTED_LANGUAGES.en;
}

/**
 * Generate language instruction for AI prompts
 */
export function generateLanguageInstruction(languageCode: string): string {
  const config = getLanguageConfig(languageCode);
  
  return `
### CRITICAL Language Requirements:
- You MUST respond EXCLUSIVELY in **${config.aiPromptName}**
- ALL content, explanations, suggestions, and text MUST be written in ${config.aiPromptName}
- ${config.culturalContext}
- Do NOT mix languages - maintain complete consistency throughout the entire response
- Use appropriate professional terminology and cultural context for the target language and region
  `.trim();
}

/**
 * Generate specific language instruction for CV generation
 */
export function generateCVLanguageInstruction(languageCode: string): string {
  const config = getLanguageConfig(languageCode);
  
  return `
### CRITICAL Language Instructions:
- Write ALL content in **${config.aiPromptName}** ONLY
- Translate and adapt ALL section headers, job descriptions, skills, and achievements to ${config.aiPromptName}
- ${config.culturalContext}
- Maintain professional tone and business language standards for the target region
- Section headers like "Experience", "Education", "Skills" must be translated to ${config.aiPromptName}
  `.trim();
}

/**
 * Get display name for language selector
 */
export function getLanguageDisplayName(languageCode: string): string {
  const config = getLanguageConfig(languageCode);
  return `${config.nativeName} (${config.name})`;
}
