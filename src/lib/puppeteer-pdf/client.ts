const MAX_IMAGE_DIMENSION = 1400;
const MAX_DATA_URL_LENGTH = 350_000;
const JPEG_QUALITY = 0.82;

function buildExportContainer(html: string) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, "text/html");
  const container = document.createElement("div");

  container.style.position = "fixed";
  container.style.left = "-200vw";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.minHeight = "1123px";
  container.style.backgroundColor = "#ffffff";
  container.style.zIndex = "-1";

  const headNodes = Array.from(
    documentNode.head.querySelectorAll("style, link[rel='stylesheet']"),
  );

  headNodes.forEach((node) => {
    container.appendChild(node.cloneNode(true));
  });

  const wrapper = document.createElement("div");
  wrapper.innerHTML = documentNode.body.innerHTML || html;
  container.appendChild(wrapper);

  return container;
}

async function waitForImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll("img"));

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

async function generatePdfBlobFromHtml(html: string) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const container = buildExportContainer(html);
  document.body.appendChild(container);

  try {
    await document.fonts.ready;
    await waitForImages(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output("blob");
  } finally {
    document.body.removeChild(container);
  }
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
