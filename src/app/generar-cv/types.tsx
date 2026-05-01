"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

export type AIModel = { provider: string; id: string; name: string };

export type CVTemplate = {
  id: string;
  name: string;
  previewImage: string | null;
  templateHtml: string;
  isDefault: boolean;
  isFavorite: boolean;
};

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
    <path d="M20.032 9.404a5.537 5.537 0 0 0-.475-4.533 5.594 5.594 0 0 0-6.015-2.677A5.603 5.603 0 0 0 9.361 3.86a5.537 5.537 0 0 0-3.695 2.679 5.594 5.594 0 0 0 .686 6.556A5.537 5.537 0 0 0 6.82 17.63a5.594 5.594 0 0 0 6.018 2.676A5.537 5.537 0 0 0 17.01 21.5a5.594 5.594 0 0 0 5.335-3.883 5.537 5.537 0 0 0 3.695-2.679 5.594 5.594 0 0 0-.686-6.556l-.322.022ZM13.02 20.14a4.14 4.14 0 0 1-2.658-.96l.13-.075 4.416-2.549a.718.718 0 0 0 .362-.63v-6.225l1.866 1.079a.066.066 0 0 1 .036.048v5.158a4.156 4.156 0 0 1-4.152 4.154ZM3.96 16.91a4.14 4.14 0 0 1-.494-2.784l.13.078 4.42 2.553a.718.718 0 0 0 .72 0l5.397-3.116v2.156a.074.074 0 0 1-.03.057l-4.468 2.58A4.156 4.156 0 0 1 3.96 16.91ZM2.88 8.04a4.14 4.14 0 0 1 2.185-1.823V11.3a.718.718 0 0 0 .36.624l5.376 3.102-1.867 1.079a.07.07 0 0 1-.065 0l-4.465-2.577A4.156 4.156 0 0 1 2.88 8.04Zm15.338 3.565-5.377-3.106 1.866-1.078a.07.07 0 0 1 .066 0l4.464 2.578a4.154 4.154 0 0 1-.625 7.493v-5.26a.718.718 0 0 0-.394-.627Zm1.858-2.793-.13-.079-4.412-2.57a.718.718 0 0 0-.726 0L9.43 9.28V7.123a.07.07 0 0 1 .027-.057l4.464-2.577a4.154 4.154 0 0 1 6.155 4.303v.013Zm-11.684 3.82-1.866-1.079a.066.066 0 0 1-.036-.048V6.347a4.154 4.154 0 0 1 6.812-3.187l-.131.075L8.657 5.784a.718.718 0 0 0-.363.63l-.002 6.218Zm1.015-2.186 2.402-1.388 2.403 1.385v2.77L11.81 14.6 9.408 13.21V10.446Z" fill="white" />
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

export function AccordionItem({
  title,
  isOpen,
  onToggle,
  children,
  icon: Icon,
}: {
  title: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <span className="font-semibold text-gray-700 text-sm sm:text-base">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
