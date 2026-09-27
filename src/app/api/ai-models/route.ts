import { NextResponse } from "next/server";

export async function GET() {
  const models: { provider: string; id: string; name: string }[] = [];

  const providers = [
    {
      provider: "openai",
      key: process.env.OPENAI_API_KEY,
      url: "https://api.openai.com/v1/models",
    },
    {
      provider: "deepseek",
      key: process.env.DEEPSEEK_API_KEY,
      url: "https://api.deepseek.com/models",
    },
  ];

  await Promise.all(
    providers.map(async ({ provider, key, url }) => {
      if (!key) return;
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) return;

        const payload = await response.json();
        const providerModels = Array.isArray(payload.data) ? payload.data : [];
        for (const model of providerModels) {
          if (typeof model.id !== "string") continue;
          if (provider === "openai" && !/^gpt-/i.test(model.id)) continue;
          models.push({ provider, id: model.id, name: model.id });
        }
      } catch {
        console.warn(`Failed to fetch ${provider} models`);
      }
    }),
  );

  return NextResponse.json({ models });
}
