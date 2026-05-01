import { NextRequest, NextResponse } from "next/server";

import { renderPdfWithExternalBrowser } from "@/lib/puppeteer-pdf/server";
import { applyTemplateToHtml } from "@/lib/cv-template";
import { prisma } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const html = typeof body?.html === "string" ? body.html.trim() : "";
    const templateId =
      typeof body?.templateId === "string" ? body.templateId.trim() : "";

    if (!html) {
      return NextResponse.json({ error: "HTML is required" }, { status: 400 });
    }

    const template = templateId
      ? await prisma.cv_templates.findUnique({
          where: { id: templateId },
          select: { template_html: true },
        })
      : null;
    const printableHtml = applyTemplateToHtml(html, template?.template_html);
    const pdfBuffer = await renderPdfWithExternalBrowser(printableHtml);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cv_generated.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF export failed";
    console.error("PDF export error:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
