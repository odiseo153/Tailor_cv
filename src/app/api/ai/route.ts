import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { validateGeneratedCvHtml } from "@/lib/cv-html-validation";
import { validateJobOfferAnalysis } from "@/lib/cv-job-analysis-validation";

// Vercel: allow up to 60s on Hobby, 300s on Pro. Set to max safe value.
export const maxDuration = 60;

const API_CONFIG = {
  DEEPSEEK: {
    key: process.env.DEEPSEEK_API_KEY ?? "",
    url: "https://api.deepseek.com/v1",
    defaultModel: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro",
  },
  OPENAI: {
    key: process.env.OPENAI_API_KEY ?? "",
    url: "https://api.openai.com/v1",
    defaultModel: process.env.OPENAI_MODEL ?? "gpt-5.5",
  },
};

type ProviderName = "openai" | "deepseek";

const PROVIDERS: Record<ProviderName, { key: string; url: string; defaultModel: string }> = {
  openai: API_CONFIG.OPENAI,
  deepseek: API_CONFIG.DEEPSEEK,
};

export async function POST(request: NextRequest) {
  try {
    const { messages, provider, modelId } = await request.json();
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.some(
        (message) =>
          !message ||
          !["system", "user", "assistant"].includes(message.role) ||
          typeof message.content !== "string",
      )
    ) {
      return NextResponse.json({ error: "Valid messages are required" }, { status: 400 });
    }

    const providers = buildProviderOrder(provider, modelId);
    if (providers.length === 0) {
      return NextResponse.json(
        { error: "No AI providers are configured. Add at least one API key in .env." },
        { status: 500 },
      );
    }

    const failures: string[] = [];

    for (const { name, model } of providers) {
      try {
        const client = new OpenAI({ apiKey: PROVIDERS[name].key, baseURL: PROVIDERS[name].url });
        const response = await client.chat.completions.create({
          model,
          messages,
          max_completion_tokens: 4000,
          ...(name === "deepseek" || !/^gpt-5/i.test(model) ? { temperature: 0.7 } : {}),
        });
        if (typeof response.choices?.[0]?.message?.content === "string" && response.choices[0].message.content.trim()) {
          let content = response.choices[0].message.content;
          const isCvRequest = messages.some(
            (message) =>
              message.role === "system" &&
              /resume strategist/i.test(message.content),
          );
          const isJobAnalysisRequest = messages.some(
            (message) =>
              message.role === "system" &&
              /job offer analysis/i.test(message.content),
          );
          if (isCvRequest) {
            content = validateGeneratedCvHtml(content);
          }
          if (isJobAnalysisRequest) {
            try {
              validateJobOfferAnalysis(
                JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/gi, "").trim()),
              );
            } catch {
              failures.push(`${name}: invalid job-analysis JSON response`);
              continue;
            }
          }
          return NextResponse.json({
            content,
            provider: name,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${name}: ${message}`);
        console.warn(`[${name}] request failed`);
      }
    }

    return NextResponse.json(
      { error: `All AI providers failed. ${failures.join(" | ")}` },
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
  const defaults = (["openai", "deepseek"] as const)
    .filter((name) => Boolean(PROVIDERS[name].key))
    .map((name) => ({ name, model: PROVIDERS[name].defaultModel }));

  if (provider && provider in PROVIDERS) {
    const name = provider as ProviderName;
    const selected = defaults.find((item) => item.name === name);
    if (selected && modelId) {
      return [
        { ...selected, model: modelId },
        ...defaults.filter((item) => item.name !== name),
      ];
    }
  }

  return defaults;
}
