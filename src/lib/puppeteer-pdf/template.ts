const PRINT_STYLE = `
  <style>
    html,
    body {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
      background: #ffffff;
      overflow-wrap: break-word;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .tailor-cv-print-page {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm;
      box-sizing: border-box;
      background: #ffffff;
    }

    :where(body:not([style]) .tailor-cv-print-page) {
      color: #111827;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 10.5pt;
      line-height: 1.42;
    }

    :where(h1, h2, h3, p, ul, ol) {
      margin-top: 0;
    }

    :where(h1) {
      font-size: 18pt;
      line-height: 1.1;
      margin-bottom: 4mm;
    }

    :where(h2) {
      border-bottom: 1px solid #d1d5db;
      font-size: 13pt;
      margin: 6mm 0 3mm;
      padding-bottom: 1.5mm;
    }

    :where(h3) {
      font-size: 11pt;
      margin: 4mm 0 1mm;
    }

    :where(p) {
      margin-bottom: 2mm;
    }

    :where(ul, ol) {
      padding-left: 5mm;
      margin-bottom: 3mm;
    }

    :where(li) {
      margin-bottom: 1.5mm;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    img, svg, canvas {
      max-width: 100%;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    section, article, aside, header, footer, table, ul, ol, h1, h2, h3, h4, h5, h6 {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    @page {
      size: 210mm 297mm;
      margin: 0;
    }
  </style>
`;

function extractTagContent(html: string, tagName: string) {
  const match = html.match(
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"),
  );

  return match ? match[1] : "";
}

function extractTagAttributes(html: string, tagName: string) {
  const match = html.match(new RegExp(`<${tagName}([^>]*)>`, "i"));

  return match?.[1] ?? "";
}

function extractBodyContent(html: string) {
  const bodyContent = extractTagContent(html, "body");

  return bodyContent || html;
}

export function buildPrintableHtml(html: string) {
  const htmlAttrs = extractTagAttributes(html, "html");
  const headContent = extractTagContent(html, "head");
  const bodyAttrs = extractTagAttributes(html, "body");
  const bodyContent = extractBodyContent(html);

  return `
    <!DOCTYPE html>
    <html${htmlAttrs}>
      <head>
        <meta charset="utf-8" />
        ${headContent}
        ${PRINT_STYLE}
      </head>
      <body${bodyAttrs}>
        <div class="tailor-cv-print-page">${bodyContent}</div>
      </body>
    </html>
  `;
}
