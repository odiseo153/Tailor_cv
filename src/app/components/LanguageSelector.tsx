"use client";

import { useI18n } from "../context/I18nContext";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GoogleTranslate from "./GoogleTranslate";

const languageNames = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  zh: { name: "中文", flag: "🇨🇳" },
};

export default function LanguageSelector({ className }: { className?: string }) {
  const { locale, changeLocale, t } = useI18n();
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Selector de idiomas nativo */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 px-3"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline-block">
              {languageNames[locale as keyof typeof languageNames]?.flag || "🌐"}{" "}
              {t("languageSelector.label")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(languageNames).map(([code, { name, flag }]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => changeLocale(code)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                locale === code && "font-bold bg-primary/10"
              )}
            >
              <span className="mr-1">{flag}</span>
              {t(`languageSelector.${code}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Google Translate */}
      <GoogleTranslate />
    </div>
  );
} 