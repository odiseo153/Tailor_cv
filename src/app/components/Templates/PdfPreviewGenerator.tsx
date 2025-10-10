"use client"

import { useEffect } from 'react';

interface PdfPreviewGeneratorProps {
  pdfUrl: string;
  onComplete: (dataUrl: string | null, error?: boolean) => void;
}

/**
 * Client-side only component that handles PDF.js functionality
 * This avoids 'canvas' dependency issues during server-side rendering
 */
export default function PdfPreviewGenerator({ pdfUrl, onComplete }: PdfPreviewGeneratorProps) {
  useEffect(() => {
    let isMounted = true;
    
    const generatePreview = async () => {
      try {
        // Only load PDF.js in the browser
        const pdfjs = await import('pdfjs-dist');

        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        // Load the PDF
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        
        // Get first page
        const page = await pdf.getPage(1);
        
        // Create canvas in the browser
        const canvas = document.createElement('canvas');
        const viewport = page.getViewport({ scale: 1.5 });
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('No se pudo obtener el contexto del canvas');
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF on canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        if (!isMounted) return;
        
        // Convert canvas to image
        const dataUrl = canvas.toDataURL('image/png');
        onComplete(dataUrl);
        
      } catch (error) {
        console.error('Error generando vista previa del PDF:', error);
        if (isMounted) {
          onComplete(null, true);
        }
      }
    };
    
    generatePreview();
    
    // Clean up
    return () => {
      isMounted = false;
    };
  }, [pdfUrl, onComplete]);
  
  // This component doesn't render anything visible
  return null;
} 