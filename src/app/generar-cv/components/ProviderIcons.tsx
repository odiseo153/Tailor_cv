"use client";

export const PROVIDERS_CONFIG = [
  { id: "deepseek", name: "DeepSeek", color: "#4D6BFE", bg: "#EEF2FF" },
  { id: "openai", name: "OpenAI", color: "#10A37F", bg: "#F0FDF4" },
  { id: "gemini", name: "Gemini", color: "#1A73E8", bg: "#EFF6FF" },
  { id: "groq", name: "Groq", color: "#F55036", bg: "#FFF1F2" },
  { id: "openrouter", name: "OpenRouter", color: "#6467F2", bg: "#F5F3FF" },
] as const;

export type ProviderId = (typeof PROVIDERS_CONFIG)[number]["id"];

const DeepSeekIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#4D6BFE" />
    <path d="M6 12C6 8.69 8.69 6 12 6C13.59 6 15.04 6.63 16.12 7.66" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 12C18 15.31 15.31 18 12 18C10.41 18 8.96 17.37 7.88 16.34" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.2" fill="white" />
  </svg>
);

const OpenAIIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#10A37F" />
    <path d="M20.032 9.404a5.537 5.537 0 0 0-.475-4.533 5.594 5.594 0 0 0-6.015-2.677A5.603 5.603 0 0 0 9.361 3.86a5.537 5.537 0 0 0-3.695 2.679 5.594 5.594 0 0 0 .686 6.556A5.537 5.537 0 0 0 6.82 17.63a5.594 5.594 0 0 0 6.018 2.676A5.537 5.537 0 0 0 17.01 21.5a5.594 5.594 0 0 0 5.335-3.883 5.537 5.537 0 0 0 3.695-2.679 5.594 5.594 0 0 0-.686-6.556l-.322.022Z" fill="white" />
  </svg>
);

const GeminiIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1A73E8" />
    <defs>
      <linearGradient id="gem-g" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#AECBFA" />
        <stop offset="1" stopColor="#E8F0FE" />
      </linearGradient>
    </defs>
    <path d="M12 3C12 3 13.8 9 19 12C13.8 15 12 21 12 21C12 21 10.2 15 5 12C10.2 9 12 3 12 3Z" fill="url(#gem-g)" />
  </svg>
);

const GroqIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#F55036" />
    <path d="M15.5 9.5C15.5 7.57 13.93 6 12 6C10.07 6 8.5 7.57 8.5 9.5V12C8.5 13.93 10.07 15.5 12 15.5H15.5V12.5H12.5C11.67 12.5 11 11.83 11 11C11 10.17 11.67 9.5 12.5 9.5H15.5V9.5Z" fill="white" />
    <path d="M15.5 12.5V15.5H16.5C17.05 15.5 17.5 15.05 17.5 14.5V13.5C17.5 12.95 17.05 12.5 16.5 12.5H15.5Z" fill="white" />
  </svg>
);

const OpenRouterIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#6467F2" />
    <path d="M5 8H13M13 8L10.5 5.5M13 8L10.5 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 16H11M11 16L13.5 13.5M11 16L13.5 18.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="5" cy="16" r="1.5" fill="white" />
    <circle cx="19" cy="8" r="1.5" fill="white" />
  </svg>
);

export function ProviderIcon({ provider, size = 20 }: { provider: string; size?: number }) {
  switch (provider) {
    case "deepseek":
      return <DeepSeekIcon size={size} />;
    case "openai":
      return <OpenAIIcon size={size} />;
    case "gemini":
      return <GeminiIcon size={size} />;
    case "groq":
      return <GroqIcon size={size} />;
    case "openrouter":
      return <OpenRouterIcon size={size} />;
    default: {
      const cfg = PROVIDERS_CONFIG.find((p) => p.id === provider);
      return (
        <span
          style={{
            width: size,
            height: size,
            background: cfg?.bg ?? "#F3F4F6",
            color: cfg?.color ?? "#6B7280",
            fontSize: size * 0.35,
          }}
          className="inline-flex items-center justify-center rounded font-bold shrink-0"
        >
          {provider.slice(0, 2).toUpperCase()}
        </span>
      );
    }
  }
}