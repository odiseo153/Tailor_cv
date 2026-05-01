export function applyTemplateToHtml(contentHtml: string, templateHtml?: string | null) {
  if (!templateHtml?.trim()) {
    return contentHtml;
  }

  if (templateHtml.includes("{{content}}")) {
    return templateHtml.replace("{{content}}", contentHtml);
  }

  if (templateHtml.includes("</body>")) {
    return templateHtml.replace("</body>", `${contentHtml}</body>`);
  }

  return `${templateHtml}${contentHtml}`;
}
