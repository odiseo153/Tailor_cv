import {
  addPreviewPageStyles,
  CV_A4_PAGE_HEIGHT,
  CV_A4_PAGE_WIDTH,
} from "@/app/generar-cv/components/CVPreviewStyles";

const MAX_IMAGE_DIMENSION = 1400;
const MAX_DATA_URL_LENGTH = 350_000;
const JPEG_QUALITY = 0.82;

async function waitForImages(root: ParentNode) {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.onload = () => resolve();
          image.onerror = () => resolve();
        }),
    ),
  );
}

function buildExportPageHtml(html: string, pageIndex: number) {
  const previewHtml = addPreviewPageStyles(html, pageIndex);
  const viewportStyle = `
    <style>
      .tailor-cv-export-viewport {
        width: ${CV_A4_PAGE_WIDTH};
        height: ${CV_A4_PAGE_HEIGHT};
        overflow: hidden;
        background: #ffffff;
      }
    </style>
  `;

  return previewHtml
    .replace(/<\/head>/i, `${viewportStyle}</head>`)
    .replace(
      /<body([^>]*)><div class="tailor-cv-page-content">/i,
      '<body$1><div class="tailor-cv-export-viewport"><div class="tailor-cv-page-content">',
    )
    .replace(/<\/div><\/body>/i, "</div></div></body>");
}

async function buildFrame(srcdoc: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "-200vw";
  iframe.style.top = "0";
  iframe.style.width = CV_A4_PAGE_WIDTH;
  iframe.style.height = CV_A4_PAGE_HEIGHT;
  iframe.style.border = "0";
  iframe.style.background = "#ffffff";
  iframe.style.opacity = "0";
  iframe.srcdoc = srcdoc;

  document.body.appendChild(iframe);

  await new Promise<void>((resolve, reject) => {
    iframe.onload = () => resolve();
    iframe.onerror = () => reject(new Error("Failed to load PDF export frame"));
  });

  const frameWindow = iframe.contentWindow;
  const frameDocument = iframe.contentDocument;

  if (!frameWindow || !frameDocument) {
    document.body.removeChild(iframe);
    throw new Error("Unable to access PDF export frame");
  }

  await frameDocument.fonts.ready;
  await waitForImages(frameDocument);

  return { iframe, frameWindow, frameDocument };
}

async function getPageCount(html: string) {
  const { iframe, frameDocument } = await buildFrame(addPreviewPageStyles(html, 0));

  try {
    const contentHeight = Math.max(
      frameDocument.documentElement.scrollHeight,
      frameDocument.body?.scrollHeight ?? 0,
    );
    const pageHeight = iframe.clientHeight || frameDocument.documentElement.clientHeight;

    if (!contentHeight || !pageHeight) {
      return 1;
    }

    return Math.max(1, Math.ceil(contentHeight / pageHeight));
  } finally {
    document.body.removeChild(iframe);
  }
}

async function generatePdfBlobFromHtml(html: string) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pageCount = await getPageCount(html);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const { iframe, frameWindow, frameDocument } = await buildFrame(
      buildExportPageHtml(html, pageIndex),
    );

    try {
      const exportViewport = frameDocument.querySelector(
        ".tailor-cv-export-viewport",
      );

      if (!exportViewport || exportViewport.nodeType !== Node.ELEMENT_NODE) {
        throw new Error("PDF export viewport not found");
      }

      const exportViewportElement = exportViewport as HTMLElement;

      const canvas = await html2canvas(exportViewportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: frameWindow.innerWidth,
        windowHeight: frameWindow.innerHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    } finally {
      document.body.removeChild(iframe);
    }
  }

  return pdf.output("blob");
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return await new Promise((resolve) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);

    if (!src.startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }

    image.src = src;
  });
}

function shouldCompressImage(src: string, image: HTMLImageElement) {
  if (src.startsWith("data:image/svg+xml") || src.startsWith("data:image/gif")) {
    return false;
  }

  return (
    src.length > MAX_DATA_URL_LENGTH ||
    image.naturalWidth > MAX_IMAGE_DIMENSION ||
    image.naturalHeight > MAX_IMAGE_DIMENSION
  );
}

function compressImage(image: HTMLImageElement) {
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestSide : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  canvas.width = width;
  canvas.height = height;

  // Use a white background so PNGs with transparency can be safely converted to JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

async function optimizeHtmlImagesForPdf(html: string) {
  if (typeof window === "undefined" || !html.includes("<img")) {
    return html;
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, "text/html");
  const images = Array.from(documentNode.querySelectorAll("img"));

  await Promise.all(
    images.map(async (img) => {
      const rawSrc = img.getAttribute("src")?.trim();

      if (!rawSrc || rawSrc.startsWith("blob:")) {
        return;
      }

      const resolvedSrc = rawSrc.startsWith("data:")
        ? rawSrc
        : new URL(rawSrc, window.location.origin).toString();
      const loadedImage = await loadImage(resolvedSrc);

      if (!loadedImage || !shouldCompressImage(resolvedSrc, loadedImage)) {
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        return;
      }

      const compressedSrc = compressImage(loadedImage);

      if (!compressedSrc) {
        return;
      }

      img.setAttribute("src", compressedSrc);
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.removeAttribute("loading");
      img.removeAttribute("decoding");
    }),
  );

  return documentNode.documentElement.outerHTML;
}

export async function generatePdfViaBrowser(
  html: string,
  _templateId?: string,
): Promise<Blob> {
  const optimizedHtml = await optimizeHtmlImagesForPdf(html);

  if (typeof window === "undefined") {
    throw new Error("PDF export is only available in the browser");
  }

  return await generatePdfBlobFromHtml(optimizedHtml);
}
