export function buildTemplatePreviewSrcDoc(templateHtml: string): string {
  const trimmed = templateHtml.trim();

  if (!trimmed) {
    return "";
  }

  if (/<!doctype html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    return injectPreviewStyles(trimmed);
  }

  return injectPreviewStyles(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    ${trimmed}
  </body>
</html>`);
}

function injectPreviewStyles(html: string): string {
  const previewStyles = `
<style data-template-preview>
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  iframe {
    border: 0;
  }
</style>`;

  const pdf2htmlExStyles = `
<style data-pdf2htmlex-preview>
  html, body {
    overflow: hidden !important;
  }

  #sidebar,
  .loading-indicator,
  .d {
    display: none !important;
  }

  #page-container {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    overflow: visible !important;
    margin: 0 auto !important;
    background: #ffffff !important;
  }

  .pf {
    margin: 0 auto !important;
    box-shadow: none !important;
  }

  .pc,
  .pc.opened {
    display: block !important;
  }
</style>`;

  const combinedStyles = html.includes("pdf2htmlEX")
    ? `${previewStyles}${pdf2htmlExStyles}`
    : previewStyles;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${combinedStyles}</head>`);
  }

  return `${combinedStyles}${html}`;
}
