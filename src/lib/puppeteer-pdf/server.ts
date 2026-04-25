import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

import { buildPrintableHtml } from "./template";

const execFileAsync = promisify(execFile);
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean) as string[];

export async function findBrowserExecutable() {
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

export async function renderPdfWithExternalBrowser(html: string) {
  const browserPath = await findBrowserExecutable();
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tailorcv-pdf-"));
  const htmlPath = path.join(tempRoot, "document.html");
  const pdfPath = path.join(tempRoot, "document.pdf");
  const profileDir = path.join(tempRoot, "browser-profile");

  try {
    await fs.mkdir(profileDir, { recursive: true });
    await fs.writeFile(htmlPath, buildPrintableHtml(html), "utf8");

    const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-crash-reporter",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profileDir}`,
      `--print-to-pdf=${pdfPath}`,
      "--print-to-pdf-no-header",
      fileUrl,
    ];

    await execFileAsync(browserPath, args, {
      windowsHide: true,
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });

    return await fs.readFile(pdfPath);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}
