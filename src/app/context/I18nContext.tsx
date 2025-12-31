"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

// Tipos para el contexto
interface I18nContextType {
  locale: string;
  changeLocale: (newLocale: string) => void;
  t: (key: string, namespace?: string) => string;
}

// Valores por defecto
const defaultContextValue: I18nContextType = {
  locale: "en",
  changeLocale: () => {},
  t: (key: string) => key,
};

// Crear el contexto
const I18nContext = createContext<I18nContextType>(defaultContextValue);

// Idiomas soportados
const SUPPORTED_LOCALES = ["en", "es", "fr", "zh"];
const DEFAULT_LOCALE = "en";
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const detectBrowserLanguage = (): string => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const savedLocale = Cookies.get(LOCALE_COOKIE_NAME);
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale;
  }

  const browserLang = window.navigator.language.split("-")[0];
  return SUPPORTED_LOCALES.includes(browserLang) ? browserLang : DEFAULT_LOCALE;
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Función para detectar el idioma del navegador

  // Cargar traducciones para un locale específico
  const loadTranslations = async (localeToLoad: string) => {
    try {
      const response = await fetch(`/locales/${localeToLoad}/common.json`);
      if (!response.ok) {
        throw new Error(
          `Failed to load translations for ${localeToLoad}, status: ${response.status}`
        );
      }
      const commonTranslations = await response.json();
    
      setTranslations({
        common: commonTranslations,
      });
    } catch (error) {
      console.error(`Failed to load translations for ${localeToLoad}:`, error);
      // Fallback to English if the requested locale fails
      if (localeToLoad !== "en") {
        try {
          const fallbackResponse = await fetch(`/locales/en/common.json`);
          if (!fallbackResponse.ok) {
            throw new Error(
              `Failed to load fallback translations, status: ${fallbackResponse.status}`
            );
          }
          const fallbackTranslations = await fallbackResponse.json();
          setTranslations({
            common: fallbackTranslations,
          });
        } catch (fallbackError) {
          console.error("Failed to load fallback translations:", fallbackError);
        }
      }
    }
  };

  // Inicialización - detectar idioma del navegador y cargar traducciones
  useEffect(() => {
    const detectedLocale = detectBrowserLanguage();
    setLocale(detectedLocale);
    Cookies.set(LOCALE_COOKIE_NAME, detectedLocale, { expires: 365 });
    loadTranslations(detectedLocale);
  }, []);

  // Función para cambiar el idioma
  const changeLocale = (newLocale: string) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.error(`Locale ${newLocale} not supported`);
      return;
    }

    setLocale(newLocale);
    Cookies.set(LOCALE_COOKIE_NAME, newLocale, { expires: 365 });
    loadTranslations(newLocale);

    // Actualizar la URL con el nuevo locale
    const url = pathname;
    if (url) {
      router.push(url);
    }
  };

  // Función de traducción simplificada
  const t = (key: string, namespace = "common"): string => {
    const keys = key.split(".");
    let current: any = translations[namespace] || {};

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return key; // Fallback a la clave si no se encuentra traducción
      }
    }

    return current || key;
  };

  const contextValue: I18nContextType = {
    locale,
    changeLocale,
    t,
  };

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
};

// Hook para usar el contexto de i18n
export const useI18n = () => useContext(I18nContext);
