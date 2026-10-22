const DEEPSEEK_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export function createDeepSeekImageDataUrl(
  fileType: unknown,
  mimeType: unknown,
  fileData: string,
): string {
  if (fileType !== "image") {
    throw new Error("DeepSeek file analysis supports image files only.");
  }

  if (typeof mimeType !== "string" || !DEEPSEEK_IMAGE_TYPES.has(mimeType)) {
    throw new Error("Unsupported image format for DeepSeek.");
  }

  return `data:${mimeType};base64,${fileData}`;
}
