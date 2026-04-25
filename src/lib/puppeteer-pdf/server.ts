import { promises as fs } from "fs";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

import { buildPrintableHtml } from "./template";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean) as string[];

async function findLocalBrowserExecutable() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("Chrome/Edge executable not found");
}

export async function findBrowserExecutable() {
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }

  if (process.env.VERCEL) {
    return await chromium.executablePath();
  }

  return await findLocalBrowserExecutable();
}

export async function renderPdfWithExternalBrowser(html: string) {
  const browserPath = await findBrowserExecutable();
  const launchArgs = process.env.VERCEL
    ? chromium.args
    : ["--no-sandbox", "--disable-setuid-sandbox"];
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    args: launchArgs,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(buildPrintableHtml(html), {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
