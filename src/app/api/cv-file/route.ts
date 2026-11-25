import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { creditsErrorBody, isOutOfCreditsError } from "@/lib/ai-credits";
import { jsonrepair } from "jsonrepair";
import { buildExtractCVInfoPrompt } from "@/app/utils/cv-prompts";
import { createDeepSeekImageDataUrl } from "./deepseek-file";

export const maxDuration = 60;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? "";
const DEEPSEEK_MODEL =
  process.env.DEEPSEEK_VISION_MODEL ?? "deepseek-flash";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

function cleanGeneratedContent(raw: string): string {
  return raw
    .replace(/```json|```/g, "")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}

function getMessageText(
  content: string | Array<{ type?: string; text?: string | null }> | null | undefined,
): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter((item) => item?.type === "text" && typeof item.text === "string")
      .map((item) => item.text)
      .join("\n")
      .trim();
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const { action, fileType, fileData, mimeType } = await request.json();

    if (!fileData || typeof fileData !== "string") {
      return NextResponse.json({ error: "Missing fileData." }, { status: 400 });
    }

    if (action === "template" || fileType === "pdf") {
      return NextResponse.json(
        { error: "DeepSeek file analysis supports image files only." },
        { status: 415 },
      );
    }

    if (action !== "extract") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not configured." },
        { status: 500 },
      );
    }

    let imageUrl: string;
    try {
      imageUrl = createDeepSeekImageDataUrl(fileType, mimeType, fileData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: message }, { status: 415 });
    }

    const deepseek = new OpenAI({
      apiKey: DEEPSEEK_API_KEY,
      baseURL: DEEPSEEK_BASE_URL,
    });
    const completion = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildExtractCVInfoPrompt("image") },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const text = cleanGeneratedContent(
      getMessageText(completion.choices[0]?.message?.content),
    );

    return NextResponse.json({ content: jsonrepair(text) });
  } catch (error) {
    if (isOutOfCreditsError(error)) {
      return NextResponse.json(creditsErrorBody("deepseek"), { status: 402 });
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error("DeepSeek CV file API error:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
