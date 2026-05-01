const A4_PAGE_WIDTH = "210mm";
const A4_PAGE_HEIGHT = "297mm";

export { A4_PAGE_WIDTH, A4_PAGE_HEIGHT };

export function addPreviewPageStyles(html: string, pageIndex: number) {
  const pageStyle = `
    <style>
      @page {
        size: ${A4_PAGE_WIDTH} ${A4_PAGE_HEIGHT};
        margin: 0;
      }

      html {
        width: ${A4_PAGE_WIDTH};
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      .tailor-cv-page-content {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        padding: 10mm;
        box-sizing: border-box;
        overflow-wrap: break-word;
        transform: translateY(calc(-${A4_PAGE_HEIGHT} * ${pageIndex}));
        transform-origin: top left;
      }

      :where(body:not([style]) .tailor-cv-page-content) {
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
    </style>
  `;

  const htmlWithStyles = /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${pageStyle}</head>`)
    : `<!DOCTYPE html><html><head>${pageStyle}</head><body>${html}</body></html>`;

  if (/<body[^>]*>/i.test(htmlWithStyles)) {
    return htmlWithStyles
      .replace(/<body([^>]*)>/i, '<body$1><div class="tailor-cv-page-content">')
      .replace(/<\/body>/i, "</div></body>");
  }

  return htmlWithStyles;
}

export function addEditablePreviewStyles(html: string) {
  const editableStyle = `
    <style>
      @page {
        size: ${A4_PAGE_WIDTH} ${A4_PAGE_HEIGHT};
        margin: 0;
      }

      html {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      .tailor-cv-edit-content {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        padding: 10mm;
        box-sizing: border-box;
        overflow-wrap: break-word;
      }

      .tailor-cv-edit-content [contenteditable="plaintext-only"] {
        outline: 1px dashed transparent;
        transition: outline-color 0.15s ease;
      }

      .tailor-cv-edit-content [contenteditable="plaintext-only"]:hover {
        outline-color: #93c5fd;
      }

      .tailor-cv-edit-content [contenteditable="plaintext-only"]:focus {
        outline-color: #2563eb;
        background: rgba(37, 99, 235, 0.04);
      }
    </style>
  `;

  const editableScript = `
    <script>
      (function () {
        const root = document.querySelector(".tailor-cv-edit-content");
        if (!root) return;

        const selectable = root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,span,a,strong,em,small");
        selectable.forEach((el) => {
          if (el.children.length === 0) {
            el.setAttribute("contenteditable", "plaintext-only");
          }
        });

        document.addEventListener("paste", function (event) {
          const target = event.target;
          if (!(target instanceof HTMLElement) || target.getAttribute("contenteditable") !== "plaintext-only") {
            return;
          }
          event.preventDefault();
          const text = (event.clipboardData || window.clipboardData).getData("text");
          document.execCommand("insertText", false, text);
        });
      })();
    </script>
  `;

  const htmlWithStyles = /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${editableStyle}</head>`)
    : `<!DOCTYPE html><html><head>${editableStyle}</head><body>${html}</body></html>`;

  return /<body[^>]*>/i.test(htmlWithStyles)
    ? htmlWithStyles
        .replace(/<body([^>]*)>/i, '<body$1><div class="tailor-cv-edit-content">')
        .replace(/<\/body>/i, `</div>${editableScript}</body>`)
    : `<!DOCTYPE html><html><head>${editableStyle}</head><body><div class="tailor-cv-edit-content">${html}</div>${editableScript}</body></html>`;
}
