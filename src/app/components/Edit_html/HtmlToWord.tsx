"use client";

import { useState } from "react";
import { twi } from "tw-to-css";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const HtmlToWord = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sampleHtml = `
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-blue-600 mb-4">Mi Currículum</h1>
      <div class="border-t-2 border-blue-100 pt-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Experiencia</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li class="text-gray-700">Desarrollador Frontend en Empresa XYZ</li>
          <li class="text-gray-700">Practicante en ABC Tech</li>
        </ul>
      </div>
    </div>
  `;

  const parseInlineStyles = (element: HTMLElement) => {
    const style: any = {};
    const inlineStyles = element.style;

    // Convertir color HEX
    if (inlineStyles.color) {
      style.color = inlineStyles.color
        .replace(/[^0-9,]/g, '')
        .split(',')
        .slice(0, 3)
        .map(num => parseInt(num.trim()).toString(16).padStart(2, '0'))
        .join('');
    }

    // Tamaño de fuente en half-points (1px = 2 half-points)
    if (inlineStyles.fontSize) {
      const size = parseInt(inlineStyles.fontSize.replace('px', ''));
      style.size = size * 2;
    }

    if (parseInt(inlineStyles.fontWeight) >= 600) style.bold = true;

    return style;
  };

  const cleanHTML = (html: string) => {
    // Remover todas las etiquetas no necesarias
    return html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/ class="[^"]*"/g, '')
      .replace(/<!--[\s\S]*?-->/g, '');
  };

  const htmlToDocxElements = (html: string) => {
    const cleanedHtml = cleanHTML(html);
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedHtml, 'text/html');
    const elements: Paragraph[] = [];

    const processNode = (node: Node): Paragraph[] => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? [new Paragraph({ children: [new TextRun({ text })] })] : [];
      }

      if (node instanceof HTMLElement) {
        const tag = node.tagName.toLowerCase();
        const styles = parseInlineStyles(node);
        const children: Paragraph[] = [];

        node.childNodes.forEach(child => {
          children.push(...processNode(child));
        });

        switch(tag) {
          case 'h1':
            return [new Paragraph({
              children: [new TextRun({
                text: node.textContent || '',
                bold: true,
                size: 48, // 24px * 2
                color: '1155CC' // blue-600 aproximado
              })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 400 }
            })];

          case 'h2':
            return [new Paragraph({
              children: [new TextRun({
                text: node.textContent || '',
                bold: true,
                size: 32, // 16px * 2
                color: '333333' // gray-800
              })],
              spacing: { after: 300 }
            })];

          case 'ul':
            return children.map(child => new Paragraph({
              ...child,
              bullet: { level: 0 }
            }));

          case 'li':
            return [new Paragraph({
              children: [new TextRun({
                text: node.textContent || '',
                ...styles
              })],
              indent: { left: 720 }
            })];

          case 'div':
            return children;

          default:
            return [new Paragraph({
              children: [new TextRun({
                text: node.textContent || '',
                ...styles
              })]
            })];
        }
      }

      return [];
    };

    doc.body.childNodes.forEach(node => {
      elements.push(...processNode(node));
    });

    return elements;
  };

  const downloadWordDoc = async (html: string) => {
    setIsLoading(true);
    try {
      const convertedHtml = twi(html, {
        minify: true,
        merge: true,
        ignoreMediaQueries: true,
        ignoreAttributes: ['class']
      });

      const docElements = htmlToDocxElements(convertedHtml);

      const doc = new Document({
        sections: [{
          properties: {},
          children: docElements
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "curriculum.docx");

    } catch (error) {
      console.error("Error:", error);
      alert("Error al generar el documento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => downloadWordDoc(sampleHtml)}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generando..." : "Descargar Word"}
        </button>

        <div 
          className="bg-white p-6 rounded-lg shadow-md" 
          dangerouslySetInnerHTML={{ __html: sampleHtml }} 
        />
      </div>
    </div>
  );
};

export default HtmlToWord;