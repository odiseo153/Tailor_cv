import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const API_CONFIG = {
  OPENROUTER: {
    key: process.env.OPENROUTER_API_KEY ?? "",
    url: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4.1-mini",
  },
  GROQ: {
    key: process.env.GROQ_API_KEY ?? "",
    url: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
  },
  DEEPSEEK: {
    key: process.env.DEEPSEEK_API_KEY ?? "",
    url: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
  },
  OPENAI: {
    key: process.env.OPENAI_API_KEY ?? "",
    url: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
  },
  GEMINI: {
    key: process.env.GEMINI_API_KEY ?? "",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/",
    defaultModel: "gemini-1.5-flash",
  },
};

// Module-level singletons — created once, reused across all requests
const clients = {
  openrouter: new OpenAI({
    apiKey: API_CONFIG.OPENROUTER.key,
    baseURL: API_CONFIG.OPENROUTER.url,
  }),
  groq: new OpenAI({
    apiKey: API_CONFIG.GROQ.key,
    baseURL: API_CONFIG.GROQ.url,
  }),
  deepseek: new OpenAI({
    apiKey: API_CONFIG.DEEPSEEK.key,
    baseURL: API_CONFIG.DEEPSEEK.url,
  }),
  openai: new OpenAI({
    apiKey: API_CONFIG.OPENAI.key,
    baseURL: API_CONFIG.OPENAI.url,
  }),
  gemini: new OpenAI({
    apiKey: API_CONFIG.GEMINI.key,
    baseURL: API_CONFIG.GEMINI.url,
  }),
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
          max_completion_tokens: 4000,
        });
        if (response.choices?.[0]?.message?.content) {
          return NextResponse.json({
            content: response.choices[0].message.content,
            provider: name,
          });
        }
      } catch (error) {
        console.warn(`[${name}] failed:`, error);
      }
    }

    return NextResponse.json(
      { error: "All AI providers failed" },
      { status: 500 },
    );
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function buildProviderOrder(provider?: string, modelId?: string) {
  const defaults = [
    {
      name: "openrouter",
      model: API_CONFIG.OPENROUTER.defaultModel,
      client: clients.openrouter,
    },
    {
      name: "groq",
      model: API_CONFIG.GROQ.defaultModel,
      client: clients.groq,
    },
    {
      name: "deepseek",
      model: API_CONFIG.DEEPSEEK.defaultModel,
      client: clients.deepseek,
    },
    {
      name: "gemini",
      model: API_CONFIG.GEMINI.defaultModel,
      client: clients.gemini,
    },
  ];

  if (provider && modelId) {
    const providerKey = provider as keyof typeof clients;
    if (clients[providerKey]) {
      const selected = {
        name: provider,
        model: modelId,
        client: clients[providerKey],
      };
      return [selected, ...defaults.filter((p) => p.name !== provider)];
    }
  }

  return defaults;
}
