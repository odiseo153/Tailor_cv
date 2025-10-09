import * as mammoth from 'mammoth';
import { GlobalWorkerOptions, getDocument, version } from 'pdfjs-dist/legacy/build/pdf';
import { FileProcessingResult, FileProcessingError } from '../types/cv-analysis';

// Configure PDF.js worker for browser environment
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
}

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_CONTENT_LENGTH = 50; // Minimum characters for valid CV content

// Supported file types
const SUPPORTED_TYPES = {
  PDF: ['application/pdf', '.pdf'],
  DOCX: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  DOC: ['application/msword', '.doc'],
  TXT: ['text/plain', '.txt']
};

/**
 * Validates if the file type is supported
 */
export function validateFileType(file: File): boolean {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  return Object.values(SUPPORTED_TYPES).some(types => 
    types.some(type => fileType === type || fileName.endsWith(type))
  );
}

/**
 * Validates file size
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Determines the file type based on MIME type and extension
 */
export function getFileType(file: File): 'pdf' | 'docx' | 'doc' | 'txt' {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  if (SUPPORTED_TYPES.PDF.some(type => fileType === type || fileName.endsWith(type))) {
    return 'pdf';
  }
  if (SUPPORTED_TYPES.DOCX.some(type => fileType === type || fileName.endsWith(type))) {
    return 'docx';
  }
  if (SUPPORTED_TYPES.DOC.some(type => fileType === type || fileName.endsWith(type))) {
    return 'doc';
  }
  return 'txt';
}

/**
 * Extracts text from PDF file using PDF.js
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Load the PDF document
    const loadingTask = getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items from the page
      const pageText = textContent.items
        .map((item: any) => 'str' in item ? item.str : '')
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF file');
  }
}

/**
 * Extracts text from Word document (DOCX/DOC)
 */
async function extractTextFromWord(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages.length > 0) {
      console.warn('Word extraction warnings:', result.messages);
    }
    
    return result.value;
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

/**
 * Extracts text from plain text file
 */
async function extractTextFromTxt(file: File): Promise<string> {
  try {
    return await file.text();
  } catch (error) {
    console.error('Text file reading error:', error);
    throw new Error('Failed to read text file');
  }
}

/**
 * Cleans and preprocesses extracted text
 */
function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with analysis
    .replace(/[^\w\s\-.,;:()\[\]@#%&*+=<>?!]/g, '')
    // Trim whitespace
    .trim();
}

/**
 * Counts words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Main function to process uploaded CV file and extract text
 */
export async function processUploadedCV(file: File): Promise<FileProcessingResult> {
  // Validate file type
  if (!validateFileType(file)) {
    throw new FileProcessingError(
      'INVALID_FILE_TYPE',
      'Unsupported file type. Please upload a PDF, Word document, or text file.',
      file.name
    );
  }

  // Validate file size
  if (!validateFileSize(file)) {
    throw new FileProcessingError(
      'FILE_TOO_LARGE',
      `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
      file.name
    );
  }

  const fileType = getFileType(file);
  let extractedText: string;

  try {
    // Extract text based on file type
    switch (fileType) {
      case 'pdf':
        extractedText = await extractTextFromPDF(file);
        break;
      case 'docx':
      case 'doc':
        extractedText = await extractTextFromWord(file);
        break;
      case 'txt':
        extractedText = await extractTextFromTxt(file);
        break;
      default:
        throw new Error('Unsupported file type');
    }

    // Clean the extracted text
    const cleanedText = cleanExtractedText(extractedText);

    // Validate content length
    if (cleanedText.length < MIN_CONTENT_LENGTH) {
      throw new FileProcessingError(
        'EMPTY_CONTENT',
        'The file appears to be empty or contains insufficient content for analysis.',
        file.name
      );
    }

    const wordCount = countWords(cleanedText);

    return {
      text: cleanedText,
      fileName: file.name,
      fileType,
      wordCount
    };

  } catch (error) {
    if (error instanceof FileProcessingError) {
      // Re-throw FileProcessingError
      throw error;
    }

    // Wrap other errors
    throw new FileProcessingError(
      'EXTRACTION_FAILED',
      error instanceof Error ? error.message : 'Failed to process the uploaded file.',
      file.name
    );
  }
}

/**
 * Validates CV content for basic structure
 */
export function validateCVContent(text: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for basic CV sections
  const hasContact = /(?:email|phone|tel|mobile|address|linkedin|github)/i.test(text);
  const hasExperience = /(?:experience|work|employment|job|position|role)/i.test(text);
  const hasEducation = /(?:education|degree|university|college|school|certification)/i.test(text);
  const hasSkills = /(?:skills|competenc|abilit|proficien|expert)/i.test(text);

  if (!hasContact) {
    issues.push('Missing contact information section');
  }
  if (!hasExperience) {
    issues.push('Missing work experience section');
  }
  if (!hasEducation) {
    issues.push('Missing education section');
  }
  if (!hasSkills) {
    issues.push('Missing skills section');
  }

  // Check minimum word count for a meaningful CV
  const wordCount = countWords(text);
  if (wordCount < 100) {
    issues.push('CV content appears too brief for comprehensive analysis');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Extracts potential keywords from CV text for analysis
 */
export function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  
  // Common technical skills patterns
  const techPatterns = [
    /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin)\b/gi,
    /\b(?:React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel)\b/gi,
    /\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|CI\/CD)\b/gi,
    /\b(?:SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch)\b/gi,
    /\b(?:HTML|CSS|SASS|LESS|Bootstrap|Tailwind)\b/gi
  ];

  // Extract technical keywords
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      keywords.push(...matches.map(match => match.toLowerCase()));
    }
  });

  // Remove duplicates and return
  return [...new Set(keywords)];
}
