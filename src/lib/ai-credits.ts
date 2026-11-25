// Shared by the AI API routes (server) and CVHandler (client).
export const AI_CREDITS_ERROR_CODE = "insufficient_credits";

const PROVIDER_LABELS: Record<string, string> = { openai: "OpenAI", deepseek: "DeepSeek" };
export const providerLabel = (provider: string) => PROVIDER_LABELS[provider] ?? provider;

/**
 * True when a provider rejected the request for lack of credits, balance or quota.
 * Works for any OpenAI-compatible provider: HTTP 402, insufficient_* codes, or the usual messages.
 */
export function isOutOfCreditsError(error: unknown): boolean {
  const e = error as { status?: number; code?: string; type?: string; message?: string } | null;
  if (!e) return false;
  if (e.status === 402) return true;
  if (/insufficient_(quota|balance|credits?|funds)/i.test(`${e.code ?? ""} ${e.type ?? ""}`)) return true;
  return /no credits|insufficient (balance|credits?|funds|quota)|exceeded your current quota|credit balance is too low/i.test(
    e.message ?? "",
  );
}

export const creditsErrorBody = (provider: string) => ({
  error: `${providerLabel(provider)} has no credits available.`,
  code: AI_CREDITS_ERROR_CODE,
  provider,
});

export class AICreditsError extends Error {
  constructor(public provider: string, message: string) {
    super(message);
    this.name = "AICreditsError";
  }
}

export function throwIfCreditsError(payload: { code?: string; provider?: string; error?: string } | null) {
  if (payload?.code === AI_CREDITS_ERROR_CODE) {
    throw new AICreditsError(payload.provider ?? "", payload.error ?? "No credits available");
  }
}
