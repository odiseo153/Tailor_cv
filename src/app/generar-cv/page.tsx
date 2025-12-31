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
import { CVHandler, ProgressCallback, AIModelConfig } from "../Handler/CVHandler";
import { Message } from "../utils/Message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import AnalysisResults from "../components/CVAnalysis/AnalysisResults";
import ThinkingAnimation from "../components/ThinkingAnimation";
import { generatePdf } from "../components/Edit_html/htmlToPdf";

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

export default function GenerarCV() {
  // CV Generation states
  const [ofertaLaboral, setOfertaLaboral] = useState<string | File>("");
  const [carrera, setCarrera] = useState<string>("");
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null);
  const [informacion, setInformacion] = useState("");
  const [data, setData] = useState<{ html: string } | null>(null);
  const [ofertaType, setOfertaType] = useState<"pdf" | "image" | "text">(
    "text"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  // AI Model selection
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

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
        : [...prev, section]
    );
  };

  // API tracking
  const [apiProgress, setApiProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);

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
  const cvHandler = new CVHandler();
  const { t, locale } = useI18n();

  // Fetch AI models
  useEffect(() => {
    fetch("/api/ai-models")
      .then((res) => res.json())
      .then((data) => setAiModels(data.models || []))
      .catch(() => setAiModels([]));
  }, []);

  const getModelConfig = (): AIModelConfig | undefined => {
    if (!selectedModel || selectedModel === "auto") return undefined;
    const model = aiModels.find((m) => `${m.provider}:${m.id}` === selectedModel);
    if (!model) return undefined;
    return { provider: model.provider as "groq" | "openrouter", modelId: model.id };
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

      const analysisResult = await cvHandler.analyzeCV(
        fileResult.text,
        analysisFormData.jobTitle,
        analysisFormData.industry,
        progressCallback,
        locale,
        getModelConfig()
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
            t("cv_generator.job_offer.validation_error.text_empty")
          );
        setIsLoading(false);
        setIsUpdating(false);
        return;
      }
      if (ofertaType !== "text" && typeof ofertaLaboral === "string") {
        if (!isSilentUpdate)
          Message.errorMessage(
            t("cv_generator.job_offer.validation_error.file_missing")
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
        getModelConfig()
      );

      setData(responseHtml);
      if (!isSilentUpdate)
        Message.successMessage(t("cv_generator.messages.success"));
    } catch (error: any) {
      console.error("Error generating CV:", error);
      if (!isSilentUpdate)
        Message.errorMessage(
          t("cv_generator.messages.error") +
            (error.message || "Error desconocido")
        );
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview?: (preview: string | null) => void
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
    try {
      const result = await generatePdf(data.html);
      if (result && result.blob) {
        const url = window.URL.createObjectURL(result.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cv_generated.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error(e);
      Message.errorMessage("Error downloading PDF");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b shadow-sm z-50 px-4 py-2">
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
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder={t("cv_generator.ai_model.placeholder") || "Auto (with fallback)"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="auto">Auto (fallback)</SelectItem>
                      {aiModels.map((m) => (
                        <SelectItem key={`${m.provider}:${m.id}`} value={`${m.provider}:${m.id}`}>
                          <span className="capitalize">[{m.provider}]</span> {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    {t("cv_generator.ai_model.description") || "Select a model or use auto-fallback if one fails."}
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
                          "cv_generator.job_offer.text_placeholder"
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
                <Button
                  onClick={handleDownloadPdf}
                  disabled={!data?.html}
                  variant="default"
                  size="sm"
                  className="gap-2 bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Download size={16} /> Download PDF
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
                  <div className="shadow-2xl bg-white">
                    <iframe
                      srcDoc={data.html}
                      className="bg-white"
                      style={{
                        width: "210mm",
                        height: "297mm",
                        border: "none",
                        pointerEvents: "auto",
                      }}
                      title="CV Preview"
                    />
                  </div>
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
      )}
    </div>
  );
}

function LoaderSpin() {
  return (
    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2 inline-block" />
  );
}
