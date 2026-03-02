import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const DEEPSEEK_MODELS_URL = "https://api.deepseek.com/models";
const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";
const GEMINI_MODELS_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

export async function GET() {
  const models: { provider: string; id: string; name: string }[] = [];

  // DeepSeek models
  try {
    const res = await fetch(DEEPSEEK_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_URL_DEESEEK}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      data.data?.forEach((m: { id: string }) => {
        models.push({ provider: "deepseek", id: m.id, name: m.id });
      });
    }
  } catch (e) {
    console.error("Failed to fetch DeepSeek models:", e);
  }

  // OpenAI models
  try {
    const res = await fetch(OPENAI_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      const relevantModels = (
        data.data as { id: string; created: number }[]
      )?.filter(
        (m) =>
          m.id.startsWith("gpt-") ||
          m.id.startsWith("o1") ||
          m.id.startsWith("o3") ||
          m.id.startsWith("o4"),
      );
      relevantModels?.sort((a, b) => b.created - a.created);
      relevantModels?.forEach((m) => {
        models.push({ provider: "openai", id: m.id, name: m.id });
      });
    }
  } catch (e) {
    console.error("Failed to fetch OpenAI models:", e);
  }

  // Gemini models
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_URL_GEMINIS;
    const res = await fetch(`${GEMINI_MODELS_URL}?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      (data.models as { name: string; displayName?: string }[])?.forEach(
        (m) => {
          const id = m.name.replace("models/", "");
          if (
            id.includes("gemini") &&
            !id.includes("embedding") &&
            !id.includes("aqa")
          ) {
            models.push({
              provider: "gemini",
              id,
              name: m.displayName || id,
            });
          }
        },
      );
    }
  } catch (e) {
    console.error("Failed to fetch Gemini models:", e);
  }

  // Groq models
  try {
    const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });
    const groqModels = await groq.models.list();
    groqModels.data?.forEach((m: { id: string }) => {
      models.push({ provider: "groq", id: m.id, name: m.id });
    });
  } catch (e) {
    console.error("Failed to fetch Groq models:", e);
  }

  // OpenRouter models
  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_OPENROUTER}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      (data.data as { id: string; name?: string }[])?.forEach((m) => {
        models.push({
          provider: "openrouter",
          id: m.id,
          name: m.name || m.id,
        });
      });
    }
  } catch (e) {
    console.error("Failed to fetch OpenRouter models:", e);
  }

  return NextResponse.json({ models });
}
