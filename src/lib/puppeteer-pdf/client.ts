const MAX_IMAGE_DIMENSION = 1400;
const MAX_DATA_URL_LENGTH = 350_000;
const JPEG_QUALITY = 0.82;

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

export async function generatePdfViaBrowser(html: string): Promise<Blob> {
  const optimizedHtml = await optimizeHtmlImagesForPdf(html);
  const response = await fetch("/api/pdf-export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ html: optimizedHtml }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "PDF export request failed");
  }

  return await response.blob();
}
