import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

  try {
    const body = await request.json();
    const to = typeof body?.to === "string" ? body.to.trim() : "";
    const subject =
      typeof body?.subject === "string" ? body.subject.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const attachment =
      body?.attachment && typeof body.attachment === "object"
        ? body.attachment
        : null;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "to, subject and message are required" },
        { status: 400 },
      );
    }

    const emailPayload: Parameters<typeof resend.emails.send>[0] = {
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [to],
      subject,
      html: message
        .split("\n")
        .map((line: string) => line.trim())
        .join("<br />"),
    };

    if (
      attachment?.filename &&
      typeof attachment.filename === "string" &&
      attachment?.content &&
      typeof attachment.content === "string"
    ) {
      emailPayload.attachments = [
        {
          filename: attachment.filename,
          content: attachment.content,
        },
      ];
    }

    const { error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Mensaje enviado correctamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email route error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
