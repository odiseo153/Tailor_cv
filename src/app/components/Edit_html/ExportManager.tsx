import React, { useState, useCallback } from 'react';
import { generatePdf } from './htmlToPdf';
import { generateWord } from './htmlToWord';

export interface ExportOptions {
  pdf?: {
    filename?: string;
    quality?: number;
    scale?: number;
    format?: 'a4' | 'letter';
    margins?: number;
  };
  word?: {
    filename?: string;
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };
}

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'generating' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  pageCount?: number;
  error?: string;
}

export const useExportManager = () => {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const updateProgress = useCallback((update: Partial<ExportProgress>) => {
    setExportProgress(prev => ({ ...prev, ...update }));
  }, []);

  const exportToPdf = useCallback(async (
    html: string,
    options?: ExportOptions['pdf']
  ): Promise<ExportResult> => {
    try {
      updateProgress({
        status: 'preparing',
        progress: 10,
        message: 'Preparing PDF export...'
      });

      // Validate HTML content
      if (!html || html.trim().length === 0) {
        throw new Error('No HTML content provided for PDF export');
      }

      updateProgress({
        status: 'generating',
        progress: 30,
        message: 'Generating PDF document...'
      });

      const result = await generatePdf(html);
      
      if (!result) {
        throw new Error('PDF generation returned no result');
      }

      updateProgress({
        status: 'complete',
        progress: 100,
        message: 'PDF export completed successfully'
      });

      return {
        success: true,
        blob: result.blob,
        filename: options?.filename || 'cv.pdf',
        pageCount: result.pageCount
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      updateProgress({
        status: 'error',
        progress: 0,
        message: 'PDF export failed',
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [updateProgress]);

  const exportToWord = useCallback(async (
    html: string,
    options?: ExportOptions['word']
  ): Promise<ExportResult> => {
    try {
      updateProgress({
        status: 'preparing',
        progress: 10,
        message: 'Preparing Word export...'
      });

      // Validate HTML content
      if (!html || html.trim().length === 0) {
        throw new Error('No HTML content provided for Word export');
      }

      updateProgress({
        status: 'generating',
        progress: 40,
        message: 'Converting HTML to Word format...'
      });

      const result = await generateWord(html, options);

      updateProgress({
        status: 'complete',
        progress: 100,
        message: 'Word export completed successfully'
      });

      return {
        success: true,
        blob: result.blob,
        filename: result.filename
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      updateProgress({
        status: 'error',
        progress: 0,
        message: 'Word export failed',
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [updateProgress]);

  const exportBoth = useCallback(async (
    html: string,
    options?: ExportOptions
  ): Promise<{ pdf: ExportResult; word: ExportResult }> => {
    updateProgress({
      status: 'preparing',
      progress: 5,
      message: 'Preparing dual export...'
    });

    const [pdfResult, wordResult] = await Promise.allSettled([
      exportToPdf(html, options?.pdf),
      exportToWord(html, options?.word)
    ]);

    updateProgress({
      status: 'complete',
      progress: 100,
      message: 'Both exports completed'
    });

    return {
      pdf: pdfResult.status === 'fulfilled' ? pdfResult.value : {
        success: false,
        error: pdfResult.status === 'rejected' ? pdfResult.reason?.message || 'PDF export failed' : 'Unknown error'
      },
      word: wordResult.status === 'fulfilled' ? wordResult.value : {
        success: false,
        error: wordResult.status === 'rejected' ? wordResult.reason?.message || 'Word export failed' : 'Unknown error'
      }
    };
  }, [exportToPdf, exportToWord, updateProgress]);

  const reset = useCallback(() => {
    setExportProgress({
      status: 'idle',
      progress: 0,
      message: ''
    });
  }, []);

  return {
    exportProgress,
    exportToPdf,
    exportToWord,
    exportBoth,
    reset
  };
};

// React component for export controls
interface ExportControlsProps {
  html: string;
  options?: ExportOptions;
  onExportComplete?: (results: { pdf?: ExportResult; word?: ExportResult }) => void;
  disabled?: boolean;
  className?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  html,
  options,
  onExportComplete,
  disabled = false,
  className = ""
}) => {
  const { exportProgress, exportToPdf, exportToWord, exportBoth, reset } = useExportManager();

  const handlePdfExport = async () => {
    const result = await exportToPdf(html, options?.pdf);
    onExportComplete?.({ pdf: result });
  };

  const handleWordExport = async () => {
    const result = await exportToWord(html, options?.word);
    onExportComplete?.({ word: result });
  };

  const handleBothExport = async () => {
    const results = await exportBoth(html, options);
    onExportComplete?.(results);
  };

  const isExporting = exportProgress.status === 'preparing' || exportProgress.status === 'generating';

  return (
    <div className={`export-controls ${className}`}>
      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePdfExport}
          disabled={disabled || isExporting}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting && exportProgress.message.includes('PDF') ? 'Exporting...' : 'Export PDF'}
        </button>
        
        <button
          onClick={handleWordExport}
          disabled={disabled || isExporting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting && exportProgress.message.includes('Word') ? 'Exporting...' : 'Export Word'}
        </button>
        
        <button
          onClick={handleBothExport}
          disabled={disabled || isExporting}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting && exportProgress.message.includes('dual') ? 'Exporting...' : 'Export Both'}
        </button>
      </div>

      {/* Progress indicator */}
      {exportProgress.status !== 'idle' && (
        <div className="export-progress">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{exportProgress.message}</span>
            <span className="text-sm font-mono">{exportProgress.progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                exportProgress.status === 'error' ? 'bg-red-500' : 
                exportProgress.status === 'complete' ? 'bg-green-500' : 
                'bg-blue-500'
              }`}
              style={{ width: `${exportProgress.progress}%` }}
            ></div>
          </div>

          {exportProgress.error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              Error: {exportProgress.error}
            </div>
          )}

          {exportProgress.status === 'complete' && (
            <button
              onClick={reset}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Utility functions for optimization
export const optimizeHtmlForExport = (html: string): string => {
  // Remove unnecessary attributes and optimize for export
  return html
    .replace(/data-[^=]*="[^"]*"/g, '') // Remove data attributes
    .replace(/style="[^"]*"/g, (match) => {
      // Keep only essential styles
      const essentialProps = ['color', 'background-color', 'font-size', 'font-weight', 'text-align', 'margin', 'padding'];
      const styles = match.slice(7, -1).split(';').filter(style => {
        return essentialProps.some(prop => style.trim().startsWith(prop));
      });
      return styles.length > 0 ? `style="${styles.join(';')}"` : '';
    })
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

export const validateHtmlForExport = (html: string): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!html || html.trim().length === 0) {
    issues.push('HTML content is empty');
  }
  
  if (html.length > 1000000) { // 1MB limit
    issues.push('HTML content is too large (>1MB)');
  }
  
  // Check for problematic elements
  const problemElements = ['script', 'iframe', 'video', 'audio'];
  problemElements.forEach(tag => {
    if (html.includes(`<${tag}`)) {
      issues.push(`Contains ${tag} elements that may cause export issues`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
};