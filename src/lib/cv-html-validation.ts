import { parse } from "node-html-parser";

export function validateGeneratedCvHtml(raw: string): string {
  const html = raw.replace(/^```(?:html)?\s*|\s*```$/gi, "").trim();
  if (!/^<!doctype html\b/i.test(html)) {
    throw new Error("AI response is not a complete HTML CV document");
  }

  const document = parse(html, { comment: false });
  const root = document.querySelector("html");
  const body = document.querySelector("body");
  if (!root || !body) {
    throw new Error("AI response is not a complete HTML CV document");
  }

  document
    .querySelectorAll("script, iframe, object, embed, base, link[rel=stylesheet]")
    .forEach((node) => node.remove());

  document.querySelectorAll("*").forEach((node) => {
    for (const name of Object.keys(node.attributes)) {
      const value = node.getAttribute(name) ?? "";
      if (/^on/i.test(name) || /^(?:href|src)\s*$/i.test(name) && /^\s*javascript:/i.test(value)) {
        node.removeAttribute(name);
      }
    }

    const inlineStyle = node.getAttribute("style");
    if (inlineStyle) node.setAttribute("style", sanitizeCss(inlineStyle));
  });

  const styles = document.querySelectorAll("style");
  if (styles.length === 0) {
    throw new Error("AI response is missing the required embedded stylesheet");
  }
  styles.forEach((style) => style.set_content(sanitizeCss(style.textContent)));

  const cleanBody = document.querySelector("body");
  if (!cleanBody?.textContent.replace(/\s+/g, " ").trim()) {
    throw new Error("AI response contains no CV content");
  }

  return `<!DOCTYPE html>\n${root.outerHTML}`;
}

function sanitizeCss(css: string): string {
  return css
    .replace(/@import\s+[^;]+;?/gi, "")
    .replace(/@font-face\s*\{[^}]*\}/gi, "")
    .replace(/url\([^)]*\)/gi, "none")
    .replace(/(?:page-break-before|break-before|page-break-after|break-after)\s*:\s*[^;}]+;?/gi, "")
    .replace(/position\s*:\s*(?:fixed|absolute)\s*;?/gi, "");
}
