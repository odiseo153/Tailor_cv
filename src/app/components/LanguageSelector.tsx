"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

import { useI18n } from "../context/I18nContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const languageFlags = {
  en: "\u{1F1FA}\u{1F1F8}",
  es: "\u{1F1EA}\u{1F1F8}",
  fr: "\u{1F1EB}\u{1F1F7}",
  zh: "\u{1F1E8}\u{1F1F3}",
} as const;

export default function LanguageSelector({
  className,
}: {
  className?: string;
}) {
  const { locale, changeLocale, t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const activeFlag =
    languageFlags[locale as keyof typeof languageFlags] ?? "\u{1F310}";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3"
            aria-label={t("languageSelector.label") || "Select language"}
          >
            <Globe className="h-4 w-4" />
            <span className="text-base leading-none" aria-hidden="true">
              {activeFlag}
            </span>
            <span className="hidden md:inline-block">
              {t(`languageSelector.${locale}`)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(languageFlags).map(([code, flag]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => changeLocale(code)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                locale === code && "font-bold bg-primary/10",
              )}
            >
              <span className="text-base leading-none" aria-hidden="true">
                {flag}
              </span>
              {t(`languageSelector.${code}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
