export const A4_PAGE_WIDTH = "210mm";
export const A4_PAGE_HEIGHT = "297mm";

const MM_TO_PX = 96 / 25.4;
const PAGE_PADDING_PX = 10 * MM_TO_PX;
const PAGE_CONTENT_HEIGHT_PX = (297 - 20) * MM_TO_PX;
const MAX_PAGES = 20;

/**
 * Splits the rendered CV (page 0 preview frame) into pages without cutting
 * elements: each page starts at the top of the first block that would cross
 * the page bottom, and headings move with the content that follows them.
 * Returns the content offset (px) where each page starts; [0] for one page.
 * Measuring real blocks instead of scrollHeight also avoids empty trailing pages.
 */
export function computePageBreaks(doc: Document): number[] {
  const root = doc.querySelector<HTMLElement>(".tailor-cv-page-content");
  const win = doc.defaultView;
  if (!root || !win) return [0];

  const isBlock = (el: Element) => {
    const display = win.getComputedStyle(el).display;
    return display !== "inline" && display !== "contents" && display !== "none";
  };
  const originY = root.getBoundingClientRect().top + PAGE_PADDING_PX;
  const units = Array.from(root.querySelectorAll("*"))
    .filter((el) => isBlock(el) && !Array.from(el.children).some(isBlock))
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top - originY,
        bottom: rect.bottom - originY,
        height: rect.height,
        heading: /^H[1-6]$/.test(el.tagName) || /title|heading/i.test(el.getAttribute("class") ?? ""),
      };
    })
    .filter((unit) => unit.height > 0)
    .sort((a, b) => a.top - b.top);
  if (!units.length) return [0];

  const contentBottom = Math.max(...units.map((unit) => unit.bottom));
  const breaks = [0];
  let start = 0;
  while (contentBottom - start > PAGE_CONTENT_HEIGHT_PX + 1 && breaks.length < MAX_PAGES) {
    const limit = start + PAGE_CONTENT_HEIGHT_PX;
    let next = limit;
    for (const unit of units) {
      if (unit.top > start + 1 && unit.top < next && unit.bottom > limit) next = unit.top;
    }
    // Never leave a heading alone at the bottom of a page.
    for (;;) {
      const last = units.filter((unit) => unit.top > start + 1 && unit.bottom <= next + 0.5).pop();
      if (!last?.heading || last.top >= next) break;
      next = last.top;
    }
    if (next <= start + 1) next = limit; // block taller than a page: cut it
    breaks.push(next);
    start = next;
  }
  return breaks;
}

export function addPreviewPageStyles(html: string, pageIndex: number, pageBreaks: number[] = [0]) {
  // Page window: shows only this page's slice, with the same margins on every page.
  const start = pageBreaks[pageIndex] ?? 0;
  const end = pageBreaks[pageIndex + 1];
  const windowStyle =
    pageIndex === 0
      ? `height: ${end === undefined ? "auto" : `${PAGE_PADDING_PX + end}px`};`
      : `margin-top: ${PAGE_PADDING_PX}px; height: ${end === undefined ? PAGE_CONTENT_HEIGHT_PX : end - start}px;`;
  const contentOffset = pageIndex === 0 ? 0 : PAGE_PADDING_PX + start;

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
        background: #ffffff !important;
      }

      body {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        display: block !important;
      }

      .tailor-cv-page-window {
        overflow: hidden;
        ${windowStyle}
      }

      .tailor-cv-page-content,
      .tailor-cv-page-content * {
        max-width: none !important;
      }

      .tailor-cv-page-content :where(.bg-gray-50, .bg-gray-100, .bg-gray-200) {
        background: transparent !important;
      }

      .tailor-cv-page-content :where(.shadow, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl) {
        box-shadow: none !important;
      }

      .tailor-cv-page-content {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        padding: 10mm;
        box-sizing: border-box;
        overflow-wrap: break-word;
        transform: translateY(-${contentOffset}px);
        transform-origin: top left;
      }

      .tailor-cv-page-content > * {
        width: 100% !important;
        max-width: none !important;
        min-height: calc(${A4_PAGE_HEIGHT} - 20mm) !important;
        margin: 0 !important;
        box-shadow: none !important;
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
      .replace(/<body([^>]*)>/i, '<body$1><div class="tailor-cv-page-window"><div class="tailor-cv-page-content">')
      .replace(/<\/body>/i, "</div></div></body>");
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
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        display: block !important;
      }

      .tailor-cv-edit-content,
      .tailor-cv-edit-content * {
        max-width: none !important;
      }

      .tailor-cv-edit-content {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        padding: 10mm;
        box-sizing: border-box;
        overflow-wrap: break-word;
      }

      .tailor-cv-edit-content > * {
        width: 100% !important;
        max-width: none !important;
        min-height: calc(${A4_PAGE_HEIGHT} - 20mm) !important;
        margin: 0 !important;
        box-shadow: none !important;
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

  const htmlWithWrapper = /<body[^>]*>/i.test(htmlWithStyles)
    ? htmlWithStyles
        .replace(
          /<body([^>]*)>/i,
          '<body$1><div class="tailor-cv-edit-content">',
        )
        .replace(/<\/body>/i, `</div>${editableScript}</body>`)
    : `<!DOCTYPE html><html><head>${editableStyle}</head><body><div class="tailor-cv-edit-content">${html}</div>${editableScript}</body></html>`;

  return htmlWithWrapper;
}
