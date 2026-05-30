import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { jsonrepair } from "jsonrepair";
import {
  buildExtractCVInfoPrompt,
  buildTemplateFromPdfPrompt,
} from "@/app/utils/cv-prompts";

export const maxDuration = 60;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const OPENAI_MODEL = "gpt-4o-mini";
const CSS_FRAMEWORK = "CSS";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function cleanGeneratedContent(raw: string, type: "html" | "json"): string {
  return raw
    .replace(type === "html" ? /```html|```/g : /```json|```/g, "")
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
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    const { action, fileType, fileData } = await request.json();

    if (!fileData || typeof fileData !== "string") {
      return NextResponse.json({ error: "Missing fileData." }, { status: 400 });
    }

    if (action === "extract") {
      if (fileType !== "image" && fileType !== "pdf") {
        return NextResponse.json(
          { error: "Invalid fileType for extraction." },
          { status: 400 },
        );
      }

      const prompt = buildExtractCVInfoPrompt(fileType);
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              fileType === "pdf"
                ? {
                    type: "file",
                    file: {
                      filename: "document.pdf",
                      file_data: `data:application/pdf;base64,${fileData}`,
                    },
                  }
                : {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${fileData}`,
                    },
                  },
            ],
          },
        ],
      });

      const text = cleanGeneratedContent(
        getMessageText(completion.choices[0]?.message?.content),
        "json",
      );

      return NextResponse.json({ content: jsonrepair(text) });
    }

    if (action === "template") {
      const prompt = buildTemplateFromPdfPrompt(CSS_FRAMEWORK);
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "file",
                file: {
                  filename: "template.pdf",
                  file_data: `data:application/pdf;base64,${fileData}`,
                },
              },
            ],
          },
        ],
      });

      const text = cleanGeneratedContent(
        getMessageText(completion.choices[0]?.message?.content),
        "html",
      );

      return NextResponse.json({ content: text });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("CV file API error:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
