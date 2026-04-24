import { NextRequest, NextResponse } from "next/server";

import { renderPdfWithExternalBrowser } from "@/lib/puppeteer-pdf/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const html = typeof body?.html === "string" ? body.html.trim() : "";

    if (!html) {
      return NextResponse.json({ error: "HTML is required" }, { status: 400 });
    }

    const pdfBuffer = await renderPdfWithExternalBrowser(html);

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
