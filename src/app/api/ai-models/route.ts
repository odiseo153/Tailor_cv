import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

export async function GET() {
  const models: { provider: string; id: string; name: string }[] = [];

  // Fetch Groq models
  try {
    const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });
    const groqModels = await groq.models.list();
    groqModels.data?.forEach((m: any) => {
      models.push({ provider: "groq", id: m.id, name: m.id });
    });
  } catch (e) {
    console.error("Failed to fetch Groq models:", e);
  }

  // Fetch OpenRouter models
  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_OPENROUTER}` },
    });
    if (res.ok) {
      const data = await res.json();
      data.data?.slice(0, 30).forEach((m: any) => {
        models.push({ provider: "openrouter", id: m.id, name: m.name || m.id });
      });
    }
  } catch (e) {
    console.error("Failed to fetch OpenRouter models:", e);
  }

  return NextResponse.json({ models });
}
