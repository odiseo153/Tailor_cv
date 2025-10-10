import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel,
  ShadingType,
  UnderlineType
} from "docx";
import { saveAs } from "file-saver";
import * as cheerio from 'cheerio';

interface WordOptions {
  filename?: string;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

interface ParsedElement {
  type: 'paragraph' | 'heading' | 'list' | 'table';
  content: string;
  level?: number;
  styles: ElementStyles;
  children?: ParsedElement[];
}

interface ElementStyles {
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  spacing?: {
    before?: number;
    after?: number;
  };
  indent?: number;
}

const parseHtmlToStructured = (html: string): ParsedElement[] => {
  // Remove style tags and their content first
  const cleanHtml = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const $ = cheerio.load(cleanHtml);
  const elements: ParsedElement[] = [];

  // Remove style and script elements from the DOM
  $('style, script').remove();

  const processElement = (element: cheerio.Element): ParsedElement | null => {
    const $el = $(element);
    const tagName = element.type.toLowerCase();
    const classNames = $el.attr('class') || '';
    const text = $el.text().trim();

    // Skip style and script elements
    if (['style', 'script', 'noscript'].includes(tagName || '')) {
      return null;
    }

    if (!text && !['table', 'tr', 'ul', 'ol'].includes(tagName || '')) {
      return null;
    }

    const styles = extractStyles($el, classNames);

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          type: 'heading',
          content: text,
          level: parseInt(tagName.charAt(1)),
          styles
        };

      case 'p':
        return {
          type: 'paragraph',
          content: text,
          styles
        };

      case 'ul':
      case 'ol':
        const listItems = $el.children('li').map((_, li) => {
          return {
            type: 'paragraph' as const,
            content: `• ${$(li).text().trim()}`,
            styles: { ...styles, indent: 720 }
          };
        }).get();
        
        return {
          type: 'list',
          content: '',
          styles,
          children: listItems
        };

      case 'table':
        return {
          type: 'table',
          content: '',
          styles,
          children: $el.find('tr').map((_, tr) => ({
            type: 'paragraph' as const,
            content: $(tr).find('td, th').map((_, cell) => $(cell).text().trim()).get().join(' | '),
            styles
          })).get()
        };

      default:
        if (text) {
          return {
            type: 'paragraph',
            content: text,
            styles
          };
        }
        return null;
    }
  };

  // Process only body content, or all content if no body tag exists
  const contentRoot = $('body').length > 0 ? $('body') : $.root();
  
  contentRoot.find('*').each((_, element) => {
    const parsed = processElement(element);
    if (parsed) {
      elements.push(parsed);
    }
  });

  // Filter out duplicate content and empty elements
  const uniqueElements = elements.filter((el, index, array) => {
    if (!el.content && !el.children?.length) return false;
    
    // Remove duplicates based on content
    const isDuplicate = array.slice(0, index).some(prev => 
      prev.content === el.content && prev.type === el.type
    );
    return !isDuplicate;
  });

  return uniqueElements;
};

const extractStyles = ($el: any, classNames: string): ElementStyles => {
  const styles: ElementStyles = {};
  const computedStyle = $el.attr('style') || '';

  // Font size mapping
  if (classNames.includes('text-xs')) styles.fontSize = 18; // 9pt
  else if (classNames.includes('text-sm')) styles.fontSize = 20; // 10pt
  else if (classNames.includes('text-base')) styles.fontSize = 24; // 12pt
  else if (classNames.includes('text-lg')) styles.fontSize = 28; // 14pt
  else if (classNames.includes('text-xl')) styles.fontSize = 32; // 16pt
  else if (classNames.includes('text-2xl')) styles.fontSize = 36; // 18pt
  else if (classNames.includes('text-3xl')) styles.fontSize = 48; // 24pt
  else styles.fontSize = 24; // Default 12pt

  // Font weight
  if (classNames.includes('font-bold') || classNames.includes('font-semibold')) {
    styles.bold = true;
  }

  // Font style
  if (classNames.includes('italic')) {
    styles.italic = true;
  }

  // Text decoration
  if (classNames.includes('underline')) {
    styles.underline = true;
  }

  // Text alignment
  if (classNames.includes('text-center')) styles.alignment = 'center';
  else if (classNames.includes('text-right')) styles.alignment = 'right';
  else if (classNames.includes('text-justify')) styles.alignment = 'justify';
  else styles.alignment = 'left';

  // Colors
  const colorMap: Record<string, string> = {
    'text-gray-600': '6b7280',
    'text-gray-700': '374151',
    'text-gray-800': '1f2937',
    'text-gray-900': '111827',
    'text-blue-600': '2563eb',
    'text-blue-700': '1d4ed8',
    'text-red-600': 'dc2626',
    'text-green-600': '16a34a',
    'text-yellow-600': 'ca8a04',
    'text-purple-600': '9333ea'
  };

  Object.entries(colorMap).forEach(([className, color]) => {
    if (classNames.includes(className)) {
      styles.color = color;
    }
  });

  // Background colors
  const bgColorMap: Record<string, string> = {
    'bg-gray-50': 'f9fafb',
    'bg-gray-100': 'f3f4f6',
    'bg-blue-50': 'eff6ff',
    'bg-blue-100': 'dbeafe'
  };

  Object.entries(bgColorMap).forEach(([className, color]) => {
    if (classNames.includes(className)) {
      styles.backgroundColor = color;
    }
  });

  // Spacing
  if (classNames.includes('mb-1')) styles.spacing = { ...styles.spacing, after: 120 };
  else if (classNames.includes('mb-2')) styles.spacing = { ...styles.spacing, after: 240 };
  else if (classNames.includes('mb-3')) styles.spacing = { ...styles.spacing, after: 360 };
  else if (classNames.includes('mb-4')) styles.spacing = { ...styles.spacing, after: 480 };
  else if (classNames.includes('mb-6')) styles.spacing = { ...styles.spacing, after: 720 };

  if (classNames.includes('mt-1')) styles.spacing = { ...styles.spacing, before: 120 };
  else if (classNames.includes('mt-2')) styles.spacing = { ...styles.spacing, before: 240 };
  else if (classNames.includes('mt-3')) styles.spacing = { ...styles.spacing, before: 360 };
  else if (classNames.includes('mt-4')) styles.spacing = { ...styles.spacing, before: 480 };
  else if (classNames.includes('mt-6')) styles.spacing = { ...styles.spacing, before: 720 };

  return styles;
};

const createWordParagraph = (element: ParsedElement): Paragraph => {
  const textRun = new TextRun({
    text: element.content,
    bold: element.styles.bold,
    italics: element.styles.italic,
    underline: element.styles.underline ? { type: UnderlineType.SINGLE } : undefined,
    size: element.styles.fontSize,
    color: element.styles.color,
  });

  const alignment = element.styles.alignment === 'center' ? AlignmentType.CENTER :
                   element.styles.alignment === 'right' ? AlignmentType.RIGHT :
                   element.styles.alignment === 'justify' ? AlignmentType.JUSTIFIED :
                   AlignmentType.LEFT;

  let headingLevel: typeof HeadingLevel[keyof typeof HeadingLevel] | undefined;
  if (element.type === 'heading') {
    switch (element.level) {
      case 1: headingLevel = HeadingLevel.HEADING_1; break;
      case 2: headingLevel = HeadingLevel.HEADING_2; break;
      case 3: headingLevel = HeadingLevel.HEADING_3; break;
      case 4: headingLevel = HeadingLevel.HEADING_4; break;
      case 5: headingLevel = HeadingLevel.HEADING_5; break;
      case 6: headingLevel = HeadingLevel.HEADING_6; break;
    }
  }

  return new Paragraph({
    children: [textRun],
    heading: headingLevel,
    alignment,
    spacing: {
      before: element.styles.spacing?.before || 0,
      after: element.styles.spacing?.after || 200,
    },
    indent: element.styles.indent ? { left: element.styles.indent } : undefined,
    shading: element.styles.backgroundColor ? {
      type: ShadingType.CLEAR,
      fill: element.styles.backgroundColor
    } : undefined
  });
};

export const generateWord = async (
  html: string, 
  options: WordOptions = {}
): Promise<{ blob: Blob; filename: string }> => {
  if (typeof window === "undefined") {
    throw new Error("generateWord can only be called in the browser");
  }

  const {
    filename = "cv.docx",
    margins = {
      top: 720,    // 0.5 inch
      right: 720,  // 0.5 inch  
      bottom: 720, // 0.5 inch
      left: 720    // 0.5 inch
    }
  } = options;

  try {
    // Parse HTML into structured elements
    const elements = parseHtmlToStructured(html);
    
    if (elements.length === 0) {
      throw new Error("No content found to convert to Word document");
    }

    // Convert parsed elements to Word paragraphs
    const paragraphs: Paragraph[] = [];
    
    elements.forEach((element) => {
      if (element.type === 'list' && element.children) {
        element.children.forEach(child => {
          paragraphs.push(createWordParagraph(child));
        });
      } else if (element.type === 'table' && element.children) {
        // For now, convert table to paragraphs
        // Future enhancement: create actual Word tables
        element.children.forEach(child => {
          paragraphs.push(createWordParagraph(child));
        });
      } else if (element.content) {
        paragraphs.push(createWordParagraph(element));
      }
    });

    // Create the Word document
    const doc = new Document({
      creator: "CV Generator",
      description: "Generated CV document",
      title: "Curriculum Vitae",
      sections: [
        {
          properties: {
            page: {
              margin: margins,
              size: {
                orientation: "portrait",
                width: 12240, // 8.5 inches in twips
                height: 15840 // 11 inches in twips
              }
            }
          },
          children: paragraphs
        }
      ]
    });

    // Generate the Word document as a blob
    const blob = await Packer.toBlob(doc);

    // Auto-download if not in test environment
    if (process.env.NODE_ENV !== "test") {
      saveAs(blob, filename);
    }

    return { blob, filename };

  } catch (error) {
    console.error("Error generating Word document:", error);
    throw new Error(`Word generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};