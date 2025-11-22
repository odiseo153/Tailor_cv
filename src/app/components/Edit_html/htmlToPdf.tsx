export const generatePdf = async (html: string): Promise<{ blob: Blob; pageCount: number } | void> => {
  if (typeof window === "undefined") return;

  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate PDF');
    }

    const blob = await response.blob();

    // Note: Server-side generation doesn't easily return page count without parsing the PDF.
    // We return 1 as a default since the exact page count isn't critical for the download functionality.
    return { blob, pageCount: 1 };
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};