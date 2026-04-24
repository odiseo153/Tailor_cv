"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadIcon,
  TextIcon,
  ImageIcon,
  Eye,
  BriefcaseIcon,
  Check,
  FileSearch,
  Sparkles,
  ChevronDown,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ProgressCallback,
  AIModelConfig,
} from "../Handler/CVHandler";
import { Message } from "../utils/Message";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppContext, useStore } from "../context/AppContext";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { Session } from "../api/auth/[...nextauth]/route";
import { useI18n } from "../context/I18nContext";
import {
  CVAnalysisTab,
  CVAnalysisFormData,
  CVAnalysisState,
} from "../types/cv-analysis";
import { processUploadedCV, validateCVContent } from "../utils/file-processing";
import { generatePdfViaBrowser } from "@/lib/puppeteer-pdf/client";
import dynamic from "next/dynamic";

const AnalysisResults = dynamic(
  () => import("../components/CVAnalysis/AnalysisResults"),
  {
    loading: () => (
      <div className="h-96 w-full animate-pulse bg-gray-100 rounded-xl" />
    ),
    ssr: false,
  },
);

const ThinkingAnimation = dynamic(
  () => import("../components/ThinkingAnimation"),
  {
    ssr: false,
  },
);

const A4_PAGE_WIDTH = "210mm";
const A4_PAGE_HEIGHT = "297mm";

function addPreviewPageStyles(html: string, pageIndex: number) {
  const pageStyle = `
    <style>
      @page {
        size: ${A4_PAGE_WIDTH} ${A4_PAGE_HEIGHT};
        margin: 0;
      }

      html {
        width: ${A4_PAGE_WIDTH};
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      .tailor-cv-page-content {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        padding: 10mm;
        box-sizing: border-box;
        overflow-wrap: break-word;
        transform: translateY(calc(-${A4_PAGE_HEIGHT} * ${pageIndex}));
        transform-origin: top left;
      }

      :where(body:not([style]) .tailor-cv-page-content) {
        color: #111827;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 10.5pt;
        line-height: 1.42;
      }

      :where(h1, h2, h3, p, ul, ol) {
        margin-top: 0;
      }

      :where(h1) {
        font-size: 18pt;
        line-height: 1.1;
        margin-bottom: 4mm;
      }

      :where(h2) {
        border-bottom: 1px solid #d1d5db;
        font-size: 13pt;
        margin: 6mm 0 3mm;
        padding-bottom: 1.5mm;
      }

      :where(h3) {
        font-size: 11pt;
        margin: 4mm 0 1mm;
      }

      :where(p) {
        margin-bottom: 2mm;
      }

      :where(ul, ol) {
        padding-left: 5mm;
        margin-bottom: 3mm;
      }

      :where(li) {
        margin-bottom: 1.5mm;
      }
    </style>
  `;

  const htmlWithStyles = /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${pageStyle}</head>`)
    : `<!DOCTYPE html><html><head>${pageStyle}</head><body>${html}</body></html>`;

  if (/<body[^>]*>/i.test(htmlWithStyles)) {
    return htmlWithStyles
      .replace(/<body([^>]*)>/i, "<body$1><div class=\"tailor-cv-page-content\">")
      .replace(/<\/body>/i, "</div></body>");
  }

  return htmlWithStyles;
}

function addEditablePreviewStyles(html: string) {
  const editableStyle = `
    <style>
      @page {
        size: ${A4_PAGE_WIDTH} ${A4_PAGE_HEIGHT};
        margin: 0;
      }

      html {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      .tailor-cv-edit-content {
        width: ${A4_PAGE_WIDTH};
        min-height: ${A4_PAGE_HEIGHT};
        padding: 10mm;
        box-sizing: border-box;
        overflow-wrap: break-word;
      }

      .tailor-cv-edit-content [contenteditable="plaintext-only"] {
        outline: 1px dashed transparent;
        transition: outline-color 0.15s ease;
      }

      .tailor-cv-edit-content [contenteditable="plaintext-only"]:hover {
        outline-color: #93c5fd;
      }

      .tailor-cv-edit-content [contenteditable="plaintext-only"]:focus {
        outline-color: #2563eb;
        background: rgba(37, 99, 235, 0.04);
      }
    </style>
  `;

  const editableScript = `
    <script>
      (function () {
        const root = document.querySelector(".tailor-cv-edit-content");
        if (!root) return;

        const selectable = root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,span,a,strong,em,small");
        selectable.forEach((el) => {
          if (el.children.length === 0) {
            el.setAttribute("contenteditable", "plaintext-only");
          }
        });

        document.addEventListener("paste", function (event) {
          const target = event.target;
          if (!(target instanceof HTMLElement) || target.getAttribute("contenteditable") !== "plaintext-only") {
            return;
          }
          event.preventDefault();
          const text = (event.clipboardData || window.clipboardData).getData("text");
          document.execCommand("insertText", false, text);
        });
      })();
    </script>
  `;

  const htmlWithStyles = /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${editableStyle}</head>`)
    : `<!DOCTYPE html><html><head>${editableStyle}</head><body>${html}</body></html>`;

  const htmlWithWrapper = /<body[^>]*>/i.test(htmlWithStyles)
    ? htmlWithStyles
        .replace(/<body([^>]*)>/i, "<body$1><div class=\"tailor-cv-edit-content\">")
        .replace(/<\/body>/i, `</div>${editableScript}</body>`)
    : `<!DOCTYPE html><html><head>${editableStyle}</head><body><div class="tailor-cv-edit-content">${html}</div>${editableScript}</body></html>`;

  return htmlWithWrapper;
}

// Accordion Component
const AccordionItem = ({
  title,
  isOpen,
  onToggle,
  children,
  icon: Icon,
}: any) => {
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <span className="font-semibold text-gray-700 text-sm sm:text-base">
            {title}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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
};

type AIModel = { provider: string; id: string; name: string };

// ─── Provider config & icons ────────────────────────────────────────────────
const PROVIDERS_CONFIG = [
  { id: "deepseek", name: "DeepSeek", color: "#4D6BFE", bg: "#EEF2FF" },
  { id: "openai", name: "OpenAI", color: "#10A37F", bg: "#F0FDF4" },
  { id: "gemini", name: "Gemini", color: "#1A73E8", bg: "#EFF6FF" },
  { id: "groq", name: "Groq", color: "#F55036", bg: "#FFF1F2" },
  {
    id: "openrouter",
    name: "OpenRouter",
    color: "#6467F2",
    bg: "#F5F3FF",
  },
] as const;

type ProviderId = (typeof PROVIDERS_CONFIG)[number]["id"];

const DeepSeekIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill="#4D6BFE" />
    <path
      d="M6 12C6 8.69 8.69 6 12 6C13.59 6 15.04 6.63 16.12 7.66"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M18 12C18 15.31 15.31 18 12 18C10.41 18 8.96 17.37 7.88 16.34"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="2.2" fill="white" />
  </svg>
);

const OpenAIIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill="#10A37F" />
    <path
      d="M20.032 9.404a5.537 5.537 0 0 0-.475-4.533 5.594 5.594 0 0 0-6.015-2.677A5.603 5.603 0 0 0 9.361 3.86a5.537 5.537 0 0 0-3.695 2.679 5.594 5.594 0 0 0 .686 6.556A5.537 5.537 0 0 0 6.82 17.63a5.594 5.594 0 0 0 6.018 2.676A5.537 5.537 0 0 0 17.01 21.5a5.594 5.594 0 0 0 5.335-3.883 5.537 5.537 0 0 0 3.695-2.679 5.594 5.594 0 0 0-.686-6.556l-.322.022ZM13.02 20.14a4.14 4.14 0 0 1-2.658-.96l.13-.075 4.416-2.549a.718.718 0 0 0 .362-.63v-6.225l1.866 1.079a.066.066 0 0 1 .036.048v5.158a4.156 4.156 0 0 1-4.152 4.154ZM3.96 16.91a4.14 4.14 0 0 1-.494-2.784l.13.078 4.42 2.553a.718.718 0 0 0 .72 0l5.397-3.116v2.156a.074.074 0 0 1-.03.057l-4.468 2.58A4.156 4.156 0 0 1 3.96 16.91ZM2.88 8.04a4.14 4.14 0 0 1 2.185-1.823V11.3a.718.718 0 0 0 .36.624l5.376 3.102-1.867 1.079a.07.07 0 0 1-.065 0l-4.465-2.577A4.156 4.156 0 0 1 2.88 8.04Zm15.338 3.565-5.377-3.106 1.866-1.078a.07.07 0 0 1 .066 0l4.464 2.578a4.154 4.154 0 0 1-.625 7.493v-5.26a.718.718 0 0 0-.394-.627Zm1.858-2.793-.13-.079-4.412-2.57a.718.718 0 0 0-.726 0L9.43 9.28V7.123a.07.07 0 0 1 .027-.057l4.464-2.577a4.154 4.154 0 0 1 6.155 4.303v.013Zm-11.684 3.82-1.866-1.079a.066.066 0 0 1-.036-.048V6.347a4.154 4.154 0 0 1 6.812-3.187l-.131.075L8.657 5.784a.718.718 0 0 0-.363.63l-.002 6.218Zm1.015-2.186 2.402-1.388 2.403 1.385v2.77L11.81 14.6 9.408 13.21V10.446Z"
      fill="white"
    />
  </svg>
);

const GeminiIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill="#1A73E8" />
    <defs>
      <linearGradient
        id="gem-g"
        x1="12"
        y1="3"
        x2="12"
        y2="21"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#AECBFA" />
        <stop offset="1" stopColor="#E8F0FE" />
      </linearGradient>
    </defs>
    <path
      d="M12 3C12 3 13.8 9 19 12C13.8 15 12 21 12 21C12 21 10.2 15 5 12C10.2 9 12 3 12 3Z"
      fill="url(#gem-g)"
    />
  </svg>
);

const GroqIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill="#F55036" />
    <path
      d="M15.5 9.5C15.5 7.57 13.93 6 12 6C10.07 6 8.5 7.57 8.5 9.5V12C8.5 13.93 10.07 15.5 12 15.5H15.5V12.5H12.5C11.67 12.5 11 11.83 11 11C11 10.17 11.67 9.5 12.5 9.5H15.5V9.5Z"
      fill="white"
    />
    <path d="M15.5 12.5V15.5H16.5C17.05 15.5 17.5 15.05 17.5 14.5V13.5C17.5 12.95 17.05 12.5 16.5 12.5H15.5Z" fill="white" />
  </svg>
);

const OpenRouterIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="6" fill="#6467F2" />
    <path
      d="M5 8H13M13 8L10.5 5.5M13 8L10.5 10.5"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 16H11M11 16L13.5 13.5M11 16L13.5 18.5"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="5" cy="16" r="1.5" fill="white" />
    <circle cx="19" cy="8" r="1.5" fill="white" />
  </svg>
);

function ProviderIcon({
  provider,
  size = 20,
}: {
  provider: string;
  size?: number;
}) {
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

export default function GenerarCV() {
  // CV Generation states
  const [ofertaLaboral, setOfertaLaboral] = useState<string | File>("");
  const [carrera, setCarrera] = useState<string>("");
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null);
  const [informacion, setInformacion] = useState("");
  const [data, setData] = useState<{ html: string } | null>(null);
  const [previewPageCount, setPreviewPageCount] = useState(1);
  const [ofertaType, setOfertaType] = useState<"pdf" | "image" | "text">(
    "text",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isManualEditMode, setIsManualEditMode] = useState(false);
  const [isManualEditReady, setIsManualEditReady] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  // AI Model selection
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelSearchOpen, setModelSearchOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [browsingProvider, setBrowsingProvider] = useState<ProviderId | null>(
    null,
  );

  // Layout & UI states
  const [zoom, setZoom] = useState(0.8);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([
    "model",
    "career",
    "job",
    "template",
    "info",
  ]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  // API tracking
  const [apiProgress, setApiProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const manualEditIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Tabs & Analysis
  const [activeTab, setActiveTab] = useState<CVAnalysisTab>("generate");
  const [analysisFormData, setAnalysisFormData] = useState<CVAnalysisFormData>({
    jobTitle: "",
    industry: "",
    cvFile: null,
  });
  const [analysisState, setAnalysisState] = useState<CVAnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
    progress: 0,
  });

  // Context & Hooks
  const { data: session } = useSession() as { data: Session | null };
  const { template } = useAppContext();
  const { templateId } = useStore();
  // cvHandler instantiated dynamically
  const { t, locale } = useI18n();

  // Fetch AI models
  useEffect(() => {
    fetch("/api/ai-models")
      .then((res) => res.json())
      .then((data) => setAiModels(data.models || []))
      .catch(() => setAiModels([]));
  }, []);

  useEffect(() => {
    setPreviewPageCount(1);
  }, [data?.html]);

  useEffect(() => {
    if (!data?.html) {
      setIsManualEditMode(false);
      setIsManualEditReady(false);
    }
  }, [data?.html]);

  const updatePreviewPageCount = (iframe: HTMLIFrameElement) => {
    const documentNode = iframe.contentDocument;

    if (!documentNode) return;

    const contentHeight = Math.max(
      documentNode.documentElement.scrollHeight,
      documentNode.body?.scrollHeight ?? 0,
    );
    const pageHeight = iframe.clientHeight || documentNode.documentElement.clientHeight;

    if (!contentHeight || !pageHeight) return;

    setPreviewPageCount(Math.max(1, Math.ceil(contentHeight / pageHeight)));
  };

  const syncManualEditsToData = () => {
    const editDoc = manualEditIframeRef.current?.contentDocument;
    const contentRoot = editDoc?.querySelector(".tailor-cv-edit-content");

    if (!editDoc || editDoc.readyState !== "complete") {
      Message.errorMessage("Editor is still loading. Try again in a second.");
      return false;
    }

    const fallbackRoot = editDoc.body;
    const sourceNode =
      contentRoot && contentRoot instanceof HTMLElement
        ? contentRoot
        : fallbackRoot && fallbackRoot instanceof HTMLElement
          ? fallbackRoot
          : null;

    if (!sourceNode) {
      Message.errorMessage("Could not read edited content.");
      return false;
    }

    let updatedHtml = sourceNode.innerHTML.trim();
    if (!contentRoot && updatedHtml.includes("tailor-cv-edit-content")) {
      const temp = document.createElement("div");
      temp.innerHTML = updatedHtml;
      const wrapper = temp.querySelector(".tailor-cv-edit-content");
      if (wrapper) {
        updatedHtml = wrapper.innerHTML.trim();
      }
    }

    if (!updatedHtml) {
      Message.errorMessage("Edited content cannot be empty.");
      return false;
    }

    setData((prev) => (prev ? { ...prev, html: updatedHtml } : prev));
    return true;
  };

  const getModelConfig = (): AIModelConfig | undefined => {
    if (!selectedModel || selectedModel === "auto") return undefined;
    const model = aiModels.find(
      (m) => `${m.provider}:${m.id}` === selectedModel,
    );
    if (!model) return undefined;
    return {
      provider: model.provider as AIModelConfig["provider"],
      modelId: model.id,
    };
  };

  // Debounce & Auto-update
  const [debouncedValues, setDebouncedValues] = useState({
    carrera,
    info: informacion,
    oferta: ofertaLaboral,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValues({ carrera, info: informacion, oferta: ofertaLaboral });
    }, 800); // 800ms debounce (slightly longer to reduce AI load)

    return () => clearTimeout(handler);
  }, [carrera, informacion, ofertaLaboral]);

  useEffect(() => {
    if (data && !isLoading && !isUpdating) {
      // Only auto-update if we already have a generated CV and not currently loading.
      // Check if values actually changed from what `data` was generated with?
      // For now, assume any change in debounced inputs triggers update.
      // handleGenerate(true);
    }
  }, [debouncedValues]);

  // Handlers
  const handleAnalyzeCV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisFormData.jobTitle.trim()) {
      Message.errorMessage("Please enter a job title");
      return;
    }
    if (!analysisFormData.industry.trim()) {
      Message.errorMessage("Please enter an industry");
      return;
    }
    if (!analysisFormData.cvFile) {
      Message.errorMessage("Please upload a CV file");
      return;
    }

    setAnalysisState((prev) => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      result: null,
      progress: 0,
    }));

    try {
      setAnalysisState((prev) => ({ ...prev, progress: 10 }));
      const fileResult = await processUploadedCV(analysisFormData.cvFile);
      setAnalysisState((prev) => ({ ...prev, progress: 25 }));

      const validation = validateCVContent(fileResult.text);
      if (!validation.isValid)
        console.warn("CV validation issues:", validation.issues);

      const progressCallback: ProgressCallback = {
        onProgress: (progress) =>
          setAnalysisState((prev) => ({ ...prev, progress })),
      };

      // Dynamically load CVHandler
      const { CVHandler } = await import("../Handler/CVHandler");
      const cvHandler = new CVHandler();

      const analysisResult = await cvHandler.analyzeCV(
        fileResult.text,
        analysisFormData.jobTitle,
        analysisFormData.industry,
        progressCallback,
        locale,
        getModelConfig(),
      );

      setAnalysisState((prev) => ({
        ...prev,
        result: analysisResult,
        progress: 100,
      }));
      Message.successMessage("CV analysis completed successfully!");
    } catch (error: any) {
      console.error("CV analysis error:", error);
      let errorMessage = "Failed to analyze CV. Please try again.";
      if (error && error.message) errorMessage = error.message;
      setAnalysisState((prev) => ({ ...prev, error: errorMessage }));
      Message.errorMessage(errorMessage);
    } finally {
      setAnalysisState((prev) => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleGenerate = async (isSilentUpdate = false) => {
    if (!isSilentUpdate) {
      setIsLoading(true);
      setData(null);
      setApiProgress(0);
      startTimeRef.current = Date.now();
    } else {
      setIsUpdating(true);
    }

    try {
      if (
        (ofertaType === "text" && typeof ofertaLaboral !== "string") ||
        (typeof ofertaLaboral === "string" && !ofertaLaboral.trim())
      ) {
        if (!isSilentUpdate)
          Message.errorMessage(
            t("cv_generator.job_offer.validation_error.text_empty"),
          );
        setIsLoading(false);
        setIsUpdating(false);
        return;
      }
      if (ofertaType !== "text" && typeof ofertaLaboral === "string") {
        if (!isSilentUpdate)
          Message.errorMessage(
            t("cv_generator.job_offer.validation_error.file_missing"),
          );
        setIsLoading(false);
        setIsUpdating(false);
        return;
      }

      const progressCallback: ProgressCallback = {
        onProgress: (progress) => setApiProgress(progress),
      };

      const templateIdToUse =
        !plantillaCV && templateId ? templateId : undefined;
      let userInfoString = informacion;

      if (session) {
        try {
          const user = session.user;
          const response = await fetch(`/api/apiHandler/user/${user.id}`);
          if (response.ok) {
            const { data } = await response.json();
            userInfoString = informacion
              ? `${informacion}\n${JSON.stringify(data)}`
              : JSON.stringify(data);
          }
        } catch (error) {
          console.error("User data fetch error:", error);
        }
      }

      // Dynamically load CVHandler
      const { CVHandler } = await import("../Handler/CVHandler");
      const cvHandler = new CVHandler();

      const responseHtml = await cvHandler.crearCV(
        ofertaLaboral,
        ofertaType,
        plantillaCV ?? template,
        userInfoString,
        carrera,
        undefined,
        templateIdToUse,
        progressCallback,
        locale,
        getModelConfig(),
      );

      setData(responseHtml);
      if (!isSilentUpdate)
        Message.successMessage(t("cv_generator.messages.success"));
    } catch (error: any) {
      console.error("Error generating CV:", error);
      if (!isSilentUpdate)
        Message.errorMessage(
          t("cv_generator.messages.error") +
            (error.message || "Error desconocido"),
        );
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview?: (preview: string | null) => void,
  ) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    if (file && setPreview) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview?.(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!data?.html) return;
    if (isManualEditMode && !syncManualEditsToData()) return;

    setIsDownloadingPdf(true);
    try {
      const pdfBlob = await generatePdfViaBrowser(data.html);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv_generated.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      Message.errorMessage("Error downloading PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveManualEdits = () => {
    if (!isManualEditReady) {
      Message.errorMessage("Editor is still loading. Try again in a second.");
      return;
    }

    if (!syncManualEditsToData()) return;
    setIsManualEditMode(false);
    setIsManualEditReady(false);
    Message.successMessage("Changes saved.");
  };

  const handleCancelManualEdit = () => {
    setIsManualEditMode(false);
    setIsManualEditReady(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Navigation */}
      <div className="bg-white border-b shadow-sm z-50 px-4 py-2 flex-shrink-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as CVAnalysisTab)}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Generate CV
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <FileSearch className="w-4 h-4" /> CV Analysis
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {activeTab === "generate" && (
        <div className="flex-1 flex overflow-hidden ">
          {/* Left Panel - 30% */}
          {!isFullScreen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-[30%] min-w-[320px] max-w-[450px] bg-white border-r flex flex-col shadow-xl z-20"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AccordionItem
                  title={t("cv_generator.ai_model.label") || "AI Model"}
                  icon={Sparkles}
                  isOpen={openSections.includes("model")}
                  onToggle={() => toggleSection("model")}
                >
                  <Popover
                    open={modelSearchOpen}
                    onOpenChange={(open) => {
                      setModelSearchOpen(open);
                      if (!open) {
                        setModelSearchQuery("");
                        setBrowsingProvider(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {selectedModel && selectedModel !== "auto" ? (
                            (() => {
                              const m = aiModels.find(
                                (x) =>
                                  `${x.provider}:${x.id}` === selectedModel,
                              );
                              return m ? (
                                <>
                                  <ProviderIcon
                                    provider={m.provider}
                                    size={18}
                                  />
                                  <span className="truncate">{m.name}</span>
                                  <span className="text-xs text-gray-400 shrink-0 capitalize">
                                    {m.provider}
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">
                                  {selectedModel}
                                </span>
                              );
                            })()
                          ) : selectedModel === "auto" ? (
                            <span className="text-gray-700">
                              Auto (fallback)
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {t("cv_generator.ai_model.placeholder") ||
                                "Select AI Model"}
                            </span>
                          )}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden"
                      align="start"
                    >
                      {/* Search */}
                      <div className="border-b">
                        <Input
                          placeholder={
                            t("cv_generator.ai_model.search_placeholder") ||
                            "Search all models..."
                          }
                          value={modelSearchQuery}
                          onChange={(e) => {
                            setModelSearchQuery(e.target.value);
                            if (e.target.value) setBrowsingProvider(null);
                          }}
                          className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          autoFocus
                        />
                      </div>

                      {/* Search results view */}
                      {modelSearchQuery ? (
                        <div className="max-h-64 overflow-auto">
                          {(
                            "auto (fallback)".includes(
                              modelSearchQuery.toLowerCase(),
                            )
                              ? [{ isAuto: true }]
                              : []
                          ).map(() => (
                            <button
                              key="auto"
                              type="button"
                              className="relative flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                              onClick={() => {
                                setSelectedModel("auto");
                                setModelSearchOpen(false);
                              }}
                            >
                              <span className="flex-1 text-left">
                                Auto (fallback)
                              </span>
                              {selectedModel === "auto" && (
                                <Check className="h-3.5 w-3.5 shrink-0" />
                              )}
                            </button>
                          ))}

                          {aiModels
                            .filter((m) =>
                              `${m.provider} ${m.id} ${m.name}`
                                .toLowerCase()
                                .includes(modelSearchQuery.toLowerCase()),
                            )
                            .map((m) => {
                              const value = `${m.provider}:${m.id}`;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  className="relative flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                                  onClick={() => {
                                    setSelectedModel(value);
                                    setModelSearchOpen(false);
                                    setModelSearchQuery("");
                                  }}
                                >
                                  <ProviderIcon
                                    provider={m.provider}
                                    size={16}
                                  />
                                  <span className="flex-1 text-left truncate">
                                    {m.name}
                                  </span>
                                  <span className="text-xs text-gray-400 capitalize shrink-0">
                                    {m.provider}
                                  </span>
                                  {selectedModel === value && (
                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                  )}
                                </button>
                              );
                            })}

                          {aiModels.filter((m) =>
                            `${m.provider} ${m.id} ${m.name}`
                              .toLowerCase()
                              .includes(modelSearchQuery.toLowerCase()),
                          ).length === 0 &&
                            !"auto (fallback)".includes(
                              modelSearchQuery.toLowerCase(),
                            ) && (
                              <p className="py-6 text-center text-sm text-muted-foreground">
                                {t("cv_generator.ai_model.no_results") ||
                                  "No models found"}
                              </p>
                            )}
                        </div>
                      ) : browsingProvider ? (
                        /* Provider models list */
                        <>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 border-b"
                            onClick={() => setBrowsingProvider(null)}
                          >
                            <ChevronDown className="h-3 w-3 rotate-90" />
                            <ProviderIcon
                              provider={browsingProvider}
                              size={14}
                            />
                            <span className="capitalize font-medium">
                              {PROVIDERS_CONFIG.find(
                                (p) => p.id === browsingProvider,
                              )?.name ?? browsingProvider}
                            </span>
                            <span className="ml-auto text-gray-400">
                              {
                                aiModels.filter(
                                  (m) => m.provider === browsingProvider,
                                ).length
                              }{" "}
                              models
                            </span>
                          </button>
                          <div className="max-h-64 overflow-auto">
                            {/* Auto option at top */}
                            {browsingProvider === null && (
                              <button
                                type="button"
                                className="relative flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                                onClick={() => {
                                  setSelectedModel("auto");
                                  setModelSearchOpen(false);
                                  setBrowsingProvider(null);
                                }}
                              >
                                <span className="flex-1 text-left">
                                  Auto (fallback)
                                </span>
                                {selectedModel === "auto" && (
                                  <Check className="h-3.5 w-3.5 shrink-0" />
                                )}
                              </button>
                            )}
                            {aiModels
                              .filter(
                                (m) => m.provider === browsingProvider,
                              )
                              .map((m) => {
                                const value = `${m.provider}:${m.id}`;
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    className="relative flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                                    onClick={() => {
                                      setSelectedModel(value);
                                      setModelSearchOpen(false);
                                      setBrowsingProvider(null);
                                    }}
                                  >
                                    <span className="flex-1 text-left truncate">
                                      {m.name}
                                    </span>
                                    {selectedModel === value && (
                                      <Check className="h-3.5 w-3.5 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            {aiModels.filter(
                              (m) => m.provider === browsingProvider,
                            ).length === 0 && (
                              <p className="py-6 text-center text-sm text-muted-foreground">
                                No models available
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        /* Provider grid view */
                        <div className="p-2">
                          {/* Auto option */}
                          <button
                            type="button"
                            className="relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent mb-1 border border-transparent hover:border-gray-100"
                            onClick={() => {
                              setSelectedModel("auto");
                              setModelSearchOpen(false);
                            }}
                          >
                            <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded bg-gray-100 text-[9px] font-bold text-gray-500 shrink-0">
                              ✦
                            </span>
                            <span className="flex-1 text-left">
                              Auto (fallback)
                            </span>
                            {selectedModel === "auto" && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                            )}
                          </button>

                          <p className="text-[10px] text-gray-400 px-2 pb-1 uppercase tracking-wider font-medium">
                            Providers
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {PROVIDERS_CONFIG.map((p) => {
                              const count = aiModels.filter(
                                (m) => m.provider === p.id,
                              ).length;
                              const isSelected = selectedModel.startsWith(
                                `${p.id}:`,
                              );
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() =>
                                    setBrowsingProvider(p.id as ProviderId)
                                  }
                                  style={
                                    isSelected
                                      ? { borderColor: p.color }
                                      : undefined
                                  }
                                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${
                                    isSelected
                                      ? "bg-gray-50"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <ProviderIcon provider={p.id} size={22} />
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-800 text-xs leading-tight">
                                      {p.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                      {count > 0
                                        ? `${count} models`
                                        : "Loading..."}
                                    </p>
                                  </div>
                                  <ChevronDown className="ml-auto h-3 w-3 -rotate-90 text-gray-400 shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-gray-500 mt-2">
                    {t("cv_generator.ai_model.description") ||
                      "Select a provider and model, or use auto-fallback."}
                  </p>
                </AccordionItem>

                <AccordionItem
                  title={t("cv_generator.career.label")}
                  icon={BriefcaseIcon}
                  isOpen={openSections.includes("career")}
                  onToggle={() => toggleSection("career")}
                >
                  <Input
                    type="text"
                    value={carrera}
                    onChange={(e) => setCarrera(e.target.value)}
                    placeholder={t("cv_generator.career.placeholder")}
                    className="bg-gray-50 border-gray-200"
                  />
                </AccordionItem>

                <AccordionItem
                  title={t("cv_generator.job_offer.label")}
                  icon={BriefcaseIcon}
                  isOpen={openSections.includes("job")}
                  onToggle={() => toggleSection("job")}
                >
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {[
                        { type: "pdf", icon: UploadIcon, label: "PDF" },
                        { type: "image", icon: ImageIcon, label: "IMG" },
                        { type: "text", icon: TextIcon, label: "TXT" },
                      ].map(({ type, icon: Icon, label }) => (
                        <Button
                          key={type}
                          type="button"
                          size="sm"
                          variant={ofertaType === type ? "default" : "outline"}
                          onClick={() => {
                            setOfertaType(type as any);
                            setOfertaLaboral("");
                          }}
                          className="flex-1"
                        >
                          <Icon size={14} className="mr-1" /> {label}
                        </Button>
                      ))}
                    </div>
                    {ofertaType === "text" ? (
                      <Textarea
                        value={ofertaLaboral as string}
                        onChange={(e) => setOfertaLaboral(e.target.value)}
                        placeholder={t(
                          "cv_generator.job_offer.text_placeholder",
                        )}
                        className="h-32 bg-gray-50 min-h-[120px]"
                      />
                    ) : (
                      <Input
                        type="file"
                        accept={ofertaType === "pdf" ? ".pdf" : "image/*"}
                        onChange={(e) =>
                          handleFileChange(e, setOfertaLaboral as any)
                        }
                        className="bg-gray-50"
                      />
                    )}
                  </div>
                </AccordionItem>

                <AccordionItem
                  title={t("cv_generator.template.label")}
                  icon={Check}
                  isOpen={openSections.includes("template")}
                  onToggle={() => toggleSection("template")}
                >
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      handleFileChange(e, setPlantillaCV, setPreviewTemplate)
                    }
                    className="bg-gray-50"
                  />
                  {previewTemplate && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-blue-600 w-full justify-start"
                        >
                          <Eye size={16} className="mr-2" />{" "}
                          {t("cv_generator.template.preview")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Template Preview</DialogTitle>
                        </DialogHeader>
                        <iframe
                          src={previewTemplate}
                          className="w-full h-96 rounded-lg border"
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </AccordionItem>

                <AccordionItem
                  title={t("cv_generator.additional_info.label")}
                  icon={TextIcon}
                  isOpen={openSections.includes("info")}
                  onToggle={() => toggleSection("info")}
                >
                  <Textarea
                    value={informacion}
                    onChange={(e) => setInformacion(e.target.value)}
                    placeholder={t("cv_generator.additional_info.placeholder")}
                    className="h-32 bg-gray-50"
                  />
                </AccordionItem>
              </div>

              {/* Actions */}
              <div className="p-4 border-t bg-white space-y-3">
                <Button
                  onClick={() => handleGenerate(false)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <LoaderSpin />
                  ) : (
                    t("cv_generator.buttons.generate")
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Right Panel - 70% Preview (or 100% if FullScreen) */}
          <div
            className={`flex-1 bg-gray-100 flex flex-col h-full relative overflow-hidden transition-all duration-300 ${
              isFullScreen ? "w-full" : "w-[70%]"
            }`}
          >
            {/* Toolbar */}
            <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  title={isFullScreen ? "Show Sidebar" : "Full Screen Mode"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={18} />
                  ) : (
                    <Maximize2 size={18} />
                  )}
                </Button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm font-mono w-12 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
                  aria-label="Zoom In"
                >
                  <ZoomIn size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(0.8)}
                  aria-label="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {isUpdating && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse">
                    <Save size={14} /> Saving...
                  </div>
                )}
                {data?.html && (
                  <>
                    {isManualEditMode ? (
                      <>
                        <Button
                          onClick={handleSaveManualEdits}
                          disabled={!isManualEditReady}
                          variant="default"
                          size="sm"
                          className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Save size={16} /> Save Edits
                        </Button>
                        <Button
                          onClick={handleCancelManualEdit}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsManualEditReady(false);
                          setIsManualEditMode(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Edit Content
                      </Button>
                    )}
                  </>
                )}
                <Button
                  onClick={handleDownloadPdf}
                  disabled={!data?.html || isDownloadingPdf}
                  variant="default"
                  size="sm"
                  className="gap-2 bg-gray-900 text-white hover:bg-gray-800"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Download size={16} /> Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-100 relative">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <ThinkingAnimation
                    type="generate"
                    progress={apiProgress}
                    message={t("thinking.generating_cv")}
                  />
                </div>
              ) : data?.html ? (
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                  }}
                  className="transition-transform duration-200 ease-out pb-32"
                >
                  {isManualEditMode ? (
                    <div className="shadow-2xl bg-white">
                      <iframe
                        ref={manualEditIframeRef}
                        srcDoc={addEditablePreviewStyles(data.html)}
                        className="bg-white"
                        onLoad={() => setIsManualEditReady(true)}
                        style={{
                          width: A4_PAGE_WIDTH,
                          height: "80vh",
                          border: "none",
                          pointerEvents: "auto",
                        }}
                        title="CV Manual Edit"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8">
                      {Array.from({ length: previewPageCount }).map((_, pageIndex) => (
                        <div key={pageIndex} className="shadow-2xl bg-white">
                          <iframe
                            srcDoc={addPreviewPageStyles(data.html, pageIndex)}
                            className="bg-white"
                            onLoad={(event) => {
                              if (pageIndex === 0) {
                                updatePreviewPageCount(event.currentTarget);
                              }
                            }}
                            scrolling="no"
                            style={{
                              width: A4_PAGE_WIDTH,
                              height: A4_PAGE_HEIGHT,
                              border: "none",
                              pointerEvents: "auto",
                            }}
                            title={`CV Preview - Page ${pageIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <div className="w-[210mm] h-[297mm] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm scale-[0.8] origin-center">
                    <Sparkles size={64} className="mb-4 text-gray-300" />
                    <p className="text-xl font-medium">Ready to generate</p>
                    <p className="text-sm max-w-xs text-center mt-2">
                      Fill the form seamlessly on the left panel and click
                      Generate to see your CV come to life.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CV Analysis Tab - Restored */}
      {activeTab === "analyze" && (
        <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <motion.form
              onSubmit={handleAnalyzeCV}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 p-6 sm:p-8 bg-white border-2 rounded-2xl shadow-xl space-y-6 h-fit"
            >
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {t("cv_analysis.title")}
                </h1>
                <p className="text-gray-600 text-sm">
                  {t("cv_analysis.subtitle")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-700">
                    {t("cv_analysis.job_title_label")}
                  </h2>
                  <BriefcaseIcon className="w-5 h-5 text-gray-500" />
                </div>
                <Input
                  type="text"
                  value={analysisFormData.jobTitle}
                  onChange={(e) =>
                    setAnalysisFormData((prev) => ({
                      ...prev,
                      jobTitle: e.target.value,
                    }))
                  }
                  placeholder={t("cv_analysis.job_title_placeholder")}
                  className="bg-gray-50 rounded-xl border-gray-200"
                  required
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-700">
                    {t("cv_analysis.industry_label")}
                  </h2>
                  <BriefcaseIcon className="w-5 h-5 text-gray-500" />
                </div>
                <Input
                  type="text"
                  value={analysisFormData.industry}
                  onChange={(e) =>
                    setAnalysisFormData((prev) => ({
                      ...prev,
                      industry: e.target.value,
                    }))
                  }
                  placeholder={t("cv_analysis.industry_placeholder")}
                  className="bg-gray-50 rounded-xl border-gray-200"
                  required
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  {t("cv_analysis.upload_label")}
                </h2>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAnalysisFormData((prev) => ({ ...prev, cvFile: file }));
                  }}
                  className="bg-gray-50 rounded-xl border-gray-200"
                  required
                />
                <p className="text-xs text-gray-500">
                  {t("cv_analysis.upload_description")}
                </p>
              </div>

              <Button
                type="submit"
                disabled={
                  analysisState.isAnalyzing ||
                  !analysisFormData.jobTitle ||
                  !analysisFormData.industry ||
                  !analysisFormData.cvFile
                }
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
              >
                {analysisState.isAnalyzing ? (
                  <LoaderSpin />
                ) : (
                  <span className="flex items-center gap-2">
                    <FileSearch className="w-5 h-5" />{" "}
                    {t("cv_analysis.analyze_button")}
                  </span>
                )}
              </Button>
            </motion.form>

            <div className="lg:col-span-3 p-3 border-2 bg-white rounded-2xl shadow-xl flex flex-col">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {t("cv_analysis.results_title")}
              </h2>
              <div className="flex-grow rounded-lg overflow-hidden bg-gray-50 min-h-[500px]">
                {analysisState.isAnalyzing ? (
                  <div className="flex items-center justify-center h-full">
                    <ThinkingAnimation
                      type="analyze"
                      progress={analysisState.progress}
                      message={t("thinking.analyzing_cv")}
                    />
                  </div>
                ) : analysisState.result ? (
                  <div className="h-full overflow-auto p-4">
                    <AnalysisResults result={analysisState.result} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                    <FileSearch size={48} className="mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">
                      {t("cv_analysis.ready_to_analyze")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

function LoaderSpin() {
  return (
    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2 inline-block" />
  );
}
