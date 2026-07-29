"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  UploadIcon,
  TextIcon,
  ImageIcon,
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
import type { ProgressCallback, AIModelConfig } from "../../Handler/CVHandler";
import { Message } from "../../utils/Message";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "../../context/AppContext";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { Session } from "../../api/auth/[...nextauth]/route";
import { useI18n } from "../../context/I18nContext";
import { generatePdfViaBrowser } from "@/lib/puppeteer-pdf/client";
import dynamic from "next/dynamic";
import { AIModel, CVTemplate } from "../types";
import { EditableJobData } from "./EditableJobData";
import { EmailComposerModal } from "./EmailComposerModal";
import { AccordionItem } from "./AccordionItem";
import { LoaderSpin } from "./LoaderSpin";
import { ProviderIcon, ProviderId, PROVIDERS_CONFIG } from "./ProviderIcons";
import {
  A4_PAGE_HEIGHT,
  A4_PAGE_WIDTH,
  addEditablePreviewStyles,
  addPreviewPageStyles,
} from "../utils/preview-html";
import { buildTemplatePreviewSrcDoc } from "@/lib/template-preview";

type GenerationStep = "input" | "analyze" | "edit" | "preview";

interface JobOfferData {
  skills: string[];
  requisitos: string[];
  seniority: string;
  keywords: string[];
  jobTitle: string;
  description: string;
}

const ThinkingAnimation = dynamic(
  () => import("../../components/ThinkingAnimation"),
  {
    ssr: false,
  },
);

export function GenerateCVModule() {
  // CV Generation states
  const [ofertaLaboral, setOfertaLaboral] = useState<string | File>("");
  const [carrera, setCarrera] = useState<string>("");
  const [informacion, setInformacion] = useState("");
  const [data, setData] = useState<{ html: string } | null>(null);
  const [previewPageCount, setPreviewPageCount] = useState(1);
  const [ofertaType, setOfertaType] = useState<"pdf" | "image" | "text">(
    "text",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isManualEditMode, setIsManualEditMode] = useState(false);
  const [isManualEditReady, setIsManualEditReady] = useState(false);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [templateSearchOpen, setTemplateSearchOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(
    null,
  );
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGeneratingEmailSubject, setIsGeneratingEmailSubject] =
    useState(false);
  const [isGeneratingEmailBody, setIsGeneratingEmailBody] = useState(false);

  // Step-based generation states
  const [currentStep, setCurrentStep] = useState<GenerationStep>("input");
  const [jobOfferData, setJobOfferData] = useState<JobOfferData | null>(null);
  const [isAnalyzingOffer, setIsAnalyzingOffer] = useState(false);

  // Editable job offer data
  const [editableSkills, setEditableSkills] = useState<string>("");
  const [editableRequisitos, setEditableRequisitos] = useState<string>("");
  const [editableSeniority, setEditableSeniority] = useState<string>("");
  const [editableKeywords, setEditableKeywords] = useState<string>("");

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

  // Context & Hooks
  const { data: session } = useSession() as { data: Session | null };
  const { templateId, setTemplateId } = useStore();
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
    fetch("/api/templates")
      .then((res) => res.json())
      .then((payload) => setTemplates(payload.templates || []))
      .catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    if (!templates.length) return;

    const matchedTemplate = templates.find((item) => item.id === templateId);
    if (matchedTemplate) return;

    const defaultTemplate = templates.find((item) => item.isDefault) ?? templates[0];
    if (defaultTemplate?.id) {
      setTemplateId(defaultTemplate.id);
    }
  }, [templateId, templates, setTemplateId]);

  useEffect(() => {
    setSelectedTemplate(
      templates.find((item) => item.id === templateId) ?? null,
    );
  }, [templateId, templates]);

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
    const pageHeight =
      iframe.clientHeight || documentNode.documentElement.clientHeight;

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
      contentRoot && contentRoot.nodeType === Node.ELEMENT_NODE
        ? (contentRoot as Element)
        : fallbackRoot && fallbackRoot.nodeType === Node.ELEMENT_NODE
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
      console.error("PDF download failed:", e);
      const message = e instanceof Error ? e.message : "Error downloading PDF";
      Message.errorMessage(message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getJobOfferContext = () => {
    if (jobOfferData) {
      return JSON.stringify(jobOfferData, null, 2);
    }

    if (typeof ofertaLaboral === "string") {
      return ofertaLaboral;
    }

    return "Job offer uploaded as file. Use a professional, concise outreach tone.";
  };

  const generateEmailFieldWithAI = async (field: "subject" | "body") => {
    const setter = field === "subject" ? setEmailSubject : setEmailBody;
    const setLoading =
      field === "subject"
        ? setIsGeneratingEmailSubject
        : setIsGeneratingEmailBody;

    setLoading(true);
    try {
      const prompt =
        field === "subject"
          ? `Generate only a concise professional email subject for a job application. Base it on this job-offer context:\n${getJobOfferContext()}\n\nReturn plain text only.`
          : `Write only the body of a professional job-application email for sending a CV. Base it on this job-offer context:\n${getJobOfferContext()}\n\nKeep it concise, recruiter-friendly, and ready to send. Return plain text only.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          ...getModelConfig(),
        }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.content) {
        throw new Error(payload?.error || "AI generation failed");
      }

      setter(payload.content.trim());
    } catch (error) {
      console.error(error);
      Message.errorMessage(
        field === "subject"
          ? "Error generating subject"
          : "Error generating email body",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendCvEmail = async () => {
    if (!data?.html) return;
    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) {
      Message.errorMessage("Recipient, subject and body are required");
      return;
    }

    setIsSendingEmail(true);
    try {
      const pdfBlob = await generatePdfViaBrowser(
        data.html,
        templateId || undefined,
      );
      const buffer = await pdfBlob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";

      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }

      const base64Pdf = btoa(binary);

      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim(),
          subject: emailSubject.trim(),
          message: emailBody.trim(),
          attachment: {
            filename: "cv_generated.pdf",
            content: base64Pdf,
          },
        }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to send email");
      }

      setEmailComposerOpen(false);
      Message.successMessage("Email sent successfully");
    } catch (error) {
      console.error(error);
      Message.errorMessage(
        error instanceof Error ? error.message : "Error sending email",
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAnalyzeOffer = async () => {
    if (
      (ofertaType === "text" && typeof ofertaLaboral !== "string") ||
      (typeof ofertaLaboral === "string" && !ofertaLaboral.trim())
    ) {
      Message.errorMessage(
        t("cv_generator.job_offer.validation_error.text_empty"),
      );
      return;
    }
    if (ofertaType !== "text" && typeof ofertaLaboral === "string") {
      Message.errorMessage(
        t("cv_generator.job_offer.validation_error.file_missing"),
      );
      return;
    }

    setIsAnalyzingOffer(true);
    setApiProgress(0);

    try {
      const progressCallback: ProgressCallback = {
        onProgress: (progress) => setApiProgress(progress),
      };

      const { CVHandler } = await import("../../Handler/CVHandler");
      const cvHandler = new CVHandler();

      const analyzedData = await cvHandler.extractJobOfferData(
        ofertaLaboral,
        ofertaType as "text" | "image" | "pdf",
        progressCallback,
        locale,
        getModelConfig(),
      );

      setJobOfferData(analyzedData);
      setEditableSkills(analyzedData.skills.join(", "));
      setEditableRequisitos(analyzedData.requisitos.join(", "));
      setEditableSeniority(analyzedData.seniority);
      setEditableKeywords(analyzedData.keywords.join(", "));
      setCurrentStep("edit");
      Message.successMessage(
        "Job offer analyzed! Review and edit the extracted data.",
      );
    } catch (error: any) {
      console.error("Error analyzing offer:", error);
      Message.errorMessage(
        "Failed to analyze job offer: " + (error.message || "Unknown error"),
      );
    } finally {
      setIsAnalyzingOffer(false);
    }
  };

  const handleCreateCV = async (isSilentUpdate = false) => {
    if (!isSilentUpdate) {
      setIsLoading(true);
      setData(null);
      setApiProgress(0);
    } else {
      setIsUpdating(true);
    }

    try {
      const progressCallback: ProgressCallback = {
        onProgress: (progress) => setApiProgress(progress),
      };

      const templateIdToUse = templateId || undefined;
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

      const { CVHandler } = await import("../../Handler/CVHandler");
      const cvHandler = new CVHandler();

      const editableJobOfferData = {
        skills: editableSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        requisitos: editableRequisitos
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        seniority: editableSeniority,
        keywords: editableKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      };

      const responseHtml = await cvHandler.crearCV(
        ofertaLaboral,
        ofertaType,
        "",
        userInfoString,
        carrera,
        undefined,
        templateIdToUse,
        progressCallback,
        locale,
        getModelConfig(),
        editableJobOfferData,
      );

      setData(responseHtml);
      setCurrentStep("preview");
      if (!isSilentUpdate && session?.user?.id) {
        const offerValue =
          typeof ofertaLaboral === "string"
            ? ofertaLaboral
            : `[${ofertaLaboral.type}] ${ofertaLaboral.name}]`;

        await fetch("/api/cv-histories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            htmlData: responseHtml.html,
            offer: offerValue,
            cvTemplateId: templateIdToUse ?? null,
          }),
        }).catch((historyError) => {
          console.error("Error saving CV history:", historyError);
        });
      }
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

  const goToStep = (step: GenerationStep) => {
    setCurrentStep(step);
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
    <div className="h-full flex overflow-hidden ">
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
                            (x) => `${x.provider}:${x.id}` === selectedModel,
                          );
                          return m ? (
                            <>
                              <ProviderIcon provider={m.provider} size={18} />
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
                        <span className="text-gray-700">Auto (fallback)</span>
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
                      {("auto (fallback)".includes(
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
                              <ProviderIcon provider={m.provider} size={16} />

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
                        <ProviderIcon provider={browsingProvider} size={14} />
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
                          .filter((m) => m.provider === browsingProvider)
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
                        {aiModels.filter((m) => m.provider === browsingProvider)
                          .length === 0 && (
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
                                isSelected ? "bg-gray-50" : "border-gray-200"
                              }`}
                            >
                              <ProviderIcon provider={p.id} size={22} />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 text-xs leading-tight">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {count > 0 ? `${count} models` : "Loading..."}
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
                    placeholder={t("cv_generator.job_offer.text_placeholder")}
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
              <div className="space-y-3">
                {selectedTemplate ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-700">
                    <p>
                      Plantilla activa:{" "}
                      <span className="font-semibold">
                        {selectedTemplate.name}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-500">
                    La plantilla es opcional. Si no eliges una, el CV se
                    generara sin plantilla base.
                  </div>
                )}

                <div className="flex gap-2">
                  <Dialog
                    open={templateSearchOpen}
                    onOpenChange={setTemplateSearchOpen}
                  >
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline">
                        Seleccionar plantilla
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="h-[90vh] w-[94vw] max-w-[94vw]">
                      <DialogHeader>
                        <DialogTitle>Seleccionar plantilla</DialogTitle>
                      </DialogHeader>
                      <div className="grid h-[78vh] gap-4 overflow-y-auto pr-1 lg:grid-cols-2">
                        {templates.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setTemplateId(item.id);
                              setTemplateSearchOpen(false);
                            }}
                            className={`rounded-2xl border p-3 text-left transition ${
                              item.id === templateId
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.name}
                                </p>
                                <div className="mt-1 flex gap-2">
                                  {item.isDefault && (
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                              {item.previewImage ? (
                                <img
                                  src={item.previewImage}
                                  alt={item.name}
                                  className="h-[32rem] w-full object-contain object-top bg-white"
                                />
                              ) : (
                                <div className="relative h-[32rem] w-full overflow-hidden bg-white">
                                  <iframe
                                    srcDoc={buildTemplatePreviewSrcDoc(
                                      item.templateHtml,
                                    )}
                                    title={item.name}
                                    className="absolute left-0 top-0 border-0 bg-white"
                                    style={{
                                      width: "210mm",
                                      height: "297mm",
                                      transform: "scale(0.58)",
                                      transformOrigin: "top left",
                                      pointerEvents: "none",
                                    }}
                                    sandbox="allow-same-origin allow-scripts"
                                  />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {selectedTemplate && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setTemplateId("")}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
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
              onClick={() => handleAnalyzeOffer()}
              disabled={isAnalyzingOffer}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all active:scale-[0.98]"
            >
              {isAnalyzingOffer ? (
                <LoaderSpin />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Analyze Job Offer
                </>
              )}
            </Button>
            <Button
              onClick={() => handleCreateCV(false)}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? <LoaderSpin /> : t("cv_generator.buttons.generate")}
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
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
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
            <EmailComposerModal
              open={emailComposerOpen}
              onOpenChange={setEmailComposerOpen}
              disabled={!data?.html || isSendingEmail}
              isSendingEmail={isSendingEmail}
              emailTo={emailTo}
              emailSubject={emailSubject}
              emailBody={emailBody}
              isGeneratingEmailSubject={isGeneratingEmailSubject}
              isGeneratingEmailBody={isGeneratingEmailBody}
              onEmailToChange={setEmailTo}
              onEmailSubjectChange={setEmailSubject}
              onEmailBodyChange={setEmailBody}
              onGenerateSubject={() => generateEmailFieldWithAI("subject")}
              onGenerateBody={() => generateEmailFieldWithAI("body")}
              onSend={handleSendCvEmail}
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-100 relative">
          {isLoading || isAnalyzingOffer ? (
            <div className="flex flex-col items-center justify-center h-full">
              <ThinkingAnimation
                type="generate"
                progress={apiProgress}
                message={
                  isAnalyzingOffer
                    ? "Analyzing job offer..."
                    : t("thinking.generating_cv")
                }
              />
            </div>
          ) : currentStep === "edit" ? (
            <EditableJobData
              editableSkills={editableSkills}
              editableRequisitos={editableRequisitos}
              editableSeniority={editableSeniority}
              editableKeywords={editableKeywords}
              onSkillsChange={setEditableSkills}
              onRequisitosChange={setEditableRequisitos}
              onSeniorityChange={setEditableSeniority}
              onKeywordsChange={setEditableKeywords}
              onBack={() => goToStep("input")}
              onCreateCV={() => handleCreateCV(false)}
              isLoading={isLoading}
            />
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
                  {Array.from({ length: previewPageCount }).map(
                    (_, pageIndex) => (
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
                    ),
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 opacity-60">
              <div className="w-[210mm] h-[297mm] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm scale-[0.8] origin-center">
                <Sparkles size={64} className="mb-4 text-gray-300" />
                <p className="text-xl font-medium">Ready to generate</p>
                <p className="text-sm max-w-xs text-center mt-2">
                  Fill the form seamlessly on the left panel and click Generate
                  to see your CV come to life.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
