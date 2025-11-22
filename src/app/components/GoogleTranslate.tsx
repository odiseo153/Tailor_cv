"use client";

import { useEffect, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { Languages, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

interface GoogleTranslateProps {
  className?: string;
}

export default function GoogleTranslate({ className = "" }: GoogleTranslateProps) {
  const { locale, t } = useI18n();
  const [isTranslateLoaded, setIsTranslateLoaded] = useState(false);
  const [isTranslateVisible, setIsTranslateVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Función de inicialización de Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: locale,
            includedLanguages: 'en,es,fr,zh,de,it,pt,ru,ja,ko,ar,hi,th,vi,tr,pl,nl,sv,da,no,fi,he,cs,hu,ro,bg,hr,sk,sl,et,lv,lt,mt,ga,cy,eu,ca,gl,is,mk,sq,sr,bs,me,az,ka,hy,be,uk,kk,ky,uz,tg,mn,my,km,lo,si,ne,bn,ta,te,ml,kn,gu,pa,ur,fa,ps,sd,dv',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          },
          'google_translate_element'
        );
        setIsTranslateLoaded(true);
      }
    };

    // Cargar el script de Google Translate si no está cargado
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    } else if (window.google && window.google.translate) {
      // Si el script ya está cargado, inicializar directamente
      window.googleTranslateElementInit();
    }

    return () => {
      // Limpiar cuando el componente se desmonte
      const script = document.getElementById('google-translate-script');
      if (script) {
        script.remove();
      }
    };
  }, [locale, mounted]);

  const toggleTranslate = () => {
    setIsTranslateVisible(!isTranslateVisible);
  };

  const hideTranslate = () => {
    setIsTranslateVisible(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botón para mostrar/ocultar Google Translate */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTranslate}
        className="flex items-center gap-2 px-3"
        title={t("googleTranslate.autoTranslate")}
      >
        <Languages className="h-4 w-4" />
        <span className="hidden md:inline-block">
          {t("googleTranslate.autoTranslate")}
        </span>
      </Button>

      {/* Panel de Google Translate */}
      {isTranslateVisible && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {t("googleTranslate.title")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideTranslate}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            {t("googleTranslate.description")}
          </div>
          
          {/* Contenedor del widget de Google Translate */}
          <div id="google_translate_element" className="google-translate-container"></div>
          
          {!isTranslateLoaded && (
            <div className="text-xs text-gray-400 italic">
              {t("googleTranslate.loading")}
            </div>
          )}
        </div>
      )}

      {/* Estilos CSS para personalizar el widget de Google Translate */}
      <style jsx global>{`
        .google-translate-container .goog-te-gadget {
          font-family: inherit !important;
          font-size: 12px !important;
        }
        
        .google-translate-container .goog-te-gadget-simple {
          background-color: transparent !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 6px 8px !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
        }
        
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value {
          color: #374151 !important;
          font-size: 12px !important;
        }
        
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value span {
          color: #6b7280 !important;
        }
        
        .google-translate-container .goog-te-gadget-icon {
          display: none !important;
        }
        
        .google-translate-container .goog-te-banner-frame {
          display: none !important;
        }
        
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        #google_translate_element .goog-te-gadget-simple {
          background: transparent !important;
          border: 1px solid #d1d5db !important;
        }
        
        .goog-te-menu-frame {
          max-height: 300px !important;
          overflow-y: auto !important;
        }
      `}</style>
    </div>
  );
}
