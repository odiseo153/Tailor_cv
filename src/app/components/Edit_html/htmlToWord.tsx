import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { convert } from "html-to-text";
import { saveAs } from "file-saver";

// Utility to map Tailwind classes to Word styles
interface StyleMap {
  fontSize?: number; // in half-points (e.g., 24 = 12pt)
  bold?: boolean;
  italic?: boolean;
  color?: string; // Hex color
  alignment?: typeof AlignmentType;
}

const mapTailwindToWordStyles = (classNames: string): StyleMap => {
  const styles: StyleMap = {};

  // Example mappings for common Tailwind classes
  if (classNames.includes("text-sm")) styles.fontSize = 20; // 10pt
  if (classNames.includes("text-base")) styles.fontSize = 24; // 12pt
  if (classNames.includes("text-lg")) styles.fontSize = 28; // 14pt
  if (classNames.includes("text-xl")) styles.fontSize = 32; // 16pt
  if (classNames.includes("font-bold")) styles.bold = true;
  if (classNames.includes("italic")) styles.italic = true;
//  if (classNames.includes("text-center")) styles.alignment = AlignmentType.CENTER;
 // if (classNames.includes("text-left")) styles.alignment = AlignmentType.LEFT;
 // if (classNames.includes("text-right")) styles.alignment = AlignmentType.RIGHT;
  if (classNames.includes("text-blue-500")) styles.color = "3B82F6"; // Tailwind blue-500
  if (classNames.includes("text-red-500")) styles.color = "EF4444"; // Tailwind red-500

  return styles;
};

// Main function to generate Word document
export const generateWord = async (html: string): Promise<void> => {
  if (typeof window === "undefined") return;

  try {
    // Create a temporary container to parse the HTML
    const container = document.createElement("div");
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 210mm; /* A4 width */
      background: white;
    `;
    container.innerHTML = html;
    document.body.appendChild(container);

    // Wait for the DOM to render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Convert HTML to structured text for parsing
    const textContent = convert(html, {
      wordwrap: 130,
      selectors: [
        { selector: "p", format: "block" },
        { selector: "h1", options: { uppercase: true, leadingLineBreaks: 2, trailingLineBreaks: 2 } },
        { selector: "h2", options: { uppercase: true, leadingLineBreaks: 2, trailingLineBreaks: 2 } },
        { selector: "ul", format: "block" },
        { selector: "li", format: "block", options: { leadingLineBreaks: 1 } },
      ],
    });

    // Parse the DOM to extract elements and their styles
    const elements = container.querySelectorAll("p, h1, h2, h3, li, span");
    const paragraphs: Paragraph[] = [];

    elements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      const classNames = element.className || "";
      const styles = mapTailwindToWordStyles(classNames);
      const text = element.textContent?.trim() || "";

      if (!text) return;

      // Determine heading level or paragraph type
      let headingLevel;
      if (tagName === "h1") headingLevel = HeadingLevel.HEADING_1;
      else if (tagName === "h2") headingLevel = HeadingLevel.HEADING_2;
      else if (tagName === "h3") headingLevel = HeadingLevel.HEADING_3;

      // Create a TextRun for the content
      const textRun = new TextRun({
        text,
        bold: styles.bold,
        italics: styles.italic,
        size: styles.fontSize,
        color: styles.color,
      });

      // Create a Paragraph with the TextRun
      const paragraph =  new Paragraph({
        children: [textRun],
        heading: headingLevel,
        alignment: styles.alignment as "center" | "start" | "end" | "both" | "mediumKashida" | "distribute" | "numTab" | "highKashida" | "lowKashida" | "thaiDistribute" | "left" | "right" | undefined,
        spacing: { after: 200 }, // Add spacing between paragraphs
      });

     

      paragraphs.push(paragraph);
    });

    // Create the Word document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 1 inch = 720 twips
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    // Generate the Word document as a blob
    const blob = await Packer.toBlob(doc);

    // Download the file
    saveAs(blob, "cv.docx");

  } catch (error) {
    console.error("Error generando Word:", error);
    throw error;
  } 
};