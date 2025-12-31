import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const API_CONFIG = {
  OPENROUTER: {
    key: process.env.NEXT_PUBLIC_API_OPENROUTER ?? "",
    url: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4.1-mini",
  },
  GROQ: {
    key: process.env.NEXT_PUBLIC_GROQ_API_KEY ?? "",
    url: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
  },
};

export async function POST(request: NextRequest) {
  try {
    const { messages, provider, modelId } = await request.json();

    const providers = buildProviderOrder(provider, modelId);

    for (const { name, model, client } of providers) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
        });
        if (response.choices?.[0]?.message?.content) {
          return NextResponse.json({ 
            content: response.choices[0].message.content,
            provider: name 
          });
        }
      } catch (error) {
        console.warn(`[${name}] failed:`, error);
      }
    }

    return NextResponse.json({ error: "All AI providers failed" }, { status: 500 });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildProviderOrder(provider?: string, modelId?: string) {
  const openrouterClient = new OpenAI({
    apiKey: API_CONFIG.OPENROUTER.key,
    baseURL: API_CONFIG.OPENROUTER.url,
  });

  const groqClient = new OpenAI({
    apiKey: API_CONFIG.GROQ.key,
    baseURL: API_CONFIG.GROQ.url,
  });

  const all = [
    { name: "openrouter", model: API_CONFIG.OPENROUTER.model, client: openrouterClient },
    { name: "groq", model: API_CONFIG.GROQ.model, client: groqClient },
  ];

  if (provider && modelId) {
    const selected = provider === "openrouter"
      ? { name: "openrouter", model: modelId, client: openrouterClient }
      : { name: "groq", model: modelId, client: groqClient };
    return [selected, ...all.filter((p) => p.name !== provider)];
  }
  return all;
}
