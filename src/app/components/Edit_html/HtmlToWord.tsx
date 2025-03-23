"use client";

import { useState } from "react";
import { twi } from "tw-to-css";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

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

  const parseStyles = (element: HTMLElement) => {
    const style: any = {};
    const computedStyles = getComputedStyle(element);

    // Mapear estilos CSS a propiedades de docx
    if (computedStyles.color !== 'rgba(0, 0, 0, 0)') {
      style.color = computedStyles.color
        .replace('rgba(', '')
        .replace(')', '')
        .split(',')
        .slice(0, 3)
        .map(num => parseInt(num.trim()).toString(16).padStart(2, '0'))
        .join('');
    }

    if (computedStyles.fontWeight === '700') style.bold = true;
    if (computedStyles.fontSize) style.size = parseInt(computedStyles.fontSize) * 2;

    return style;
  };

  const htmlToDocxElements = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements: Paragraph[] = [];

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          return new Paragraph({
            children: [new TextRun({ text })],
          });
        }
      } else if (node instanceof HTMLElement) {
        const children: Paragraph[] = [];
        
        // Procesar hijos recursivamente
        node.childNodes.forEach(child => {
          const result = processNode(child);
          if (result) children.push(result);
        });

        // Manejar elementos específicos
        const tag = node.tagName.toLowerCase();
        const styles = parseStyles(node);

        switch(tag) {
          case 'h1':
            return new Paragraph({
              children: [new TextRun({ text: node.textContent, ...styles })],
              spacing: { after: 400 },
            });
          
          case 'li':
            return new Paragraph({
              children: [new TextRun({
                text: `• ${node.textContent}`,
                ...styles
              })],
              indent: { left: 720 },
            });

          default:
            return new Paragraph({
              children: [new TextRun({ text: node.textContent, ...styles })],
            });
        }
      }
      return null;
    };

    doc.body.childNodes.forEach(node => {
      const element = processNode(node);
      if (element) elements.push(element);
    });

    return elements;
  };

  const downloadWordDoc = async (html: string) => {
    setIsLoading(true);
    try {
      const convertedHtml = twi(html, {
        minify: true,
        merge: true,
        ignoreMediaQueries: true
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