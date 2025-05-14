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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("flex items-center gap-2 px-3", className)}
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
  );
} 