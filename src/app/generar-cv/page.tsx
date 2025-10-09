"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { UploadIcon, TextIcon, ImageIcon, Eye, BriefcaseIcon, Check, FileSearch, Sparkles } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ShowHtml from "../components/Edit_html/Index"
import CVSkeleton from "../components/Edit_html/CV_Skeleton"
import { CVHandler, ProgressCallback } from "../Handler/CVHandler"
import { Message } from "../utils/Message"
import { useAppContext, useStore } from "../context/AppContext"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Session } from "../api/auth/[...nextauth]/route"
import { detectBrowserLanguage, useI18n } from "../context/I18nContext"
import { CVAnalysisTab, CVAnalysisFormData, CVAnalysisState, CVAnalysisResult, FileProcessingError } from "../types/cv-analysis"
import { processUploadedCV, validateCVContent } from "../utils/file-processing"
import AnalysisResults from "../components/CVAnalysis/AnalysisResults"


export default function GenerarCV() {
  // CV Generation states
  const [ofertaLaboral, setOfertaLaboral] = useState<string | File>("") // Allow string or File
  const [carrera, setCarrera] = useState<string>("") // Allow string or File
  const [plantillaCV, setPlantillaCV] = useState<File | null>(null)
  const [informacion, setInformacion] = useState("")
  const [data, setData] = useState<{ html: string } | null>(null)
  const [ofertaType, setOfertaType] = useState<"pdf" | "image" | "text">("text")
  const [isLoading, setIsLoading] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("")

  // API tracking states
  const [infoApiDone, setInfoApiDone] = useState(false)
  const [templateApiDone, setTemplateApiDone] = useState(false)
  const [apiProgress, setApiProgress] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  // Tab and CV Analysis states
  const [activeTab, setActiveTab] = useState<CVAnalysisTab>("generate")
  const [analysisFormData, setAnalysisFormData] = useState<CVAnalysisFormData>({
    jobTitle: "",
    industry: "",
    cvFile: null
  })
  const [analysisState, setAnalysisState] = useState<CVAnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
    progress: 0
  })
  const { data: session } = useSession() as {
    data: Session | null;
  };
  const { template } = useAppContext()
  const { templateId } = useStore()
  const cvHandler = new CVHandler()
  
  // Add i18n context
  const { t, locale } = useI18n();


  // Cargar la plantilla seleccionada cuando se carga la página
 /*
 useEffect(() => {
  const fetchSelectedTemplate = async () => {
    if (templateId) {
        try {
          const response = await fetch("/api/templates");
          if (response.ok) {
            const data = await response.json();
            const selectedTemplate = data.pdfFiles.find(
              (template: any) => template.id.toString() === templateId
            );

            if (selectedTemplate) {
              setSelectedTemplateName(selectedTemplate.name);
              // No cargamos el archivo automáticamente, solo guardamos la información
            }
          }
        } catch (error) {
          console.error("Error al cargar la plantilla seleccionada:", error);
        }
      }
    };

    fetchSelectedTemplate();
  }, [templateId]);
  */

  // CV Analysis handler
  const handleAnalyzeCV = async (e: React.FormEvent) => {
    e.preventDefault()
    
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

    setAnalysisState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      result: null,
      progress: 0
    }));

    try {
      // Process the uploaded file
      setAnalysisState(prev => ({ ...prev, progress: 10 }));
      const fileResult = await processUploadedCV(analysisFormData.cvFile);
      
      setAnalysisState(prev => ({ ...prev, progress: 25 }));
      
      // Validate CV content
      const validation = validateCVContent(fileResult.text);
      if (!validation.isValid) {
        console.warn("CV validation issues:", validation.issues);
        // Continue with analysis but log issues
      }

      // Progress callback for analysis
      const progressCallback: ProgressCallback = {
        onProgress: (progress) => setAnalysisState(prev => ({ ...prev, progress }))
      };

      // Analyze the CV

      const analysisResult = await cvHandler.analyzeCV(
        fileResult.text,
        analysisFormData.jobTitle,
        analysisFormData.industry,
        progressCallback,
        locale
      );
      
      setAnalysisState(prev => ({
        ...prev,
        result: analysisResult,
        progress: 100
      }));
      
      Message.successMessage("CV analysis completed successfully!");

    } catch (error) {
      console.error("CV analysis error:", error);
      
      let errorMessage = "Failed to analyze CV. Please try again.";
      
      if (error instanceof Error && 'code' in error) {
        const fileError = error as FileProcessingError;
        errorMessage = fileError.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAnalysisState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      Message.errorMessage(errorMessage);
    } finally {
      setAnalysisState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setData(null); // Clear previous data when submitting

    // Reset API tracking states
    setInfoApiDone(false);
    setTemplateApiDone(false);
    setApiProgress(0);
    startTimeRef.current = Date.now();

    try {
      // Basic validation
      if (ofertaType === 'text' && typeof ofertaLaboral !== 'string' || (typeof ofertaLaboral === 'string' && !ofertaLaboral.trim())) {
        Message.errorMessage(t('cv_generator.job_offer.validation_error.text_empty'));
        setIsLoading(false);
        return;
      }
      if (ofertaType !== 'text' && typeof ofertaLaboral === 'string') { // ofertaLaboral should be a File object if not text
        Message.errorMessage(t('cv_generator.job_offer.validation_error.file_missing'));
        setIsLoading(false);
        return;
      }

      // Progress callback for tracking API status
      const progressCallback: ProgressCallback = {
        onInfoProcessed: () => setInfoApiDone(true),
        onTemplateProcessed: () => setTemplateApiDone(true),
        onProgress: (progress) => setApiProgress(progress)
      };

      // Pasar el templateId solo si no hay un plantillaCV cargado
      const templateIdToUse = !plantillaCV && templateId ? templateId : undefined;

      // Preparar toda la información del usuario antes de generar el CV
      let userInfoString = informacion;
      
      if(session) {
        try {
          const user = session.user;
          const response = await fetch(`/api/apiHandler/user/${user.id}`);
          
          if(response.ok) {
            const {data} = await response.json();
            console.log("Datos del usuario cargados:", data);
            
            // Crear un nuevo string con los datos del usuario en lugar de modificar el estado
            userInfoString = informacion ? `${informacion}\n${JSON.stringify(data)}` : JSON.stringify(data);
          } else {
            console.error("Error al obtener los datos del usuario:", response.statusText);
          }
        } catch(error) {
          console.error("Error al cargar datos del usuario:", error);
        }
      }
     
      // Create the CV with progress tracking using userInfoString que ya contiene los datos del usuario
      const responseHtml = await cvHandler.crearCV(
        ofertaLaboral,
        ofertaType,
        plantillaCV ?? template,
        userInfoString, // Usamos la variable local que ya tiene los datos del usuario
        carrera,
        undefined, // foto
        templateIdToUse,
        progressCallback,
        locale
      );

      setData(responseHtml)
      Message.successMessage(t('cv_generator.messages.success'))
    } catch (error: any) {
      console.error("Error generating CV:", error);
      Message.errorMessage(t('cv_generator.messages.error') + (error.message || "Error desconocido"));
    } finally {
      setIsLoading(false)
      // Optionally clear inputs after success, but maybe keep them for regeneration?
      // setOfertaLaboral("")
      // setPlantillaCV(null)
      // setInformacion("")
      // setPreviewTemplate(null); // Clear template preview if inputs are cleared
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void, setPreview?: (preview: string | null) => void) => {
    const file = e.target.files?.[0] || null
    setFile(file)
    if (file && setPreview) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview?.(null);
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <motion.main
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container mx-auto max-w-7xl py-8"
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CVAnalysisTab)} className="w-full">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="generate" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Generate CV
              </TabsTrigger>
              <TabsTrigger 
                value="analyze" 
                className="flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <FileSearch className="w-4 h-4" />
                Get Recommendations
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Generate CV Tab */}
          <TabsContent value="generate" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Formulario - Left Column */}
              <motion.form
                onSubmit={handleSubmit}
                variants={fadeIn}
                className="lg:col-span-2 p-6 sm:p-8 bg-white border-2 rounded-2xl shadow-xl space-y-6 h-fit"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6" 
                    dangerouslySetInnerHTML={{ __html: t('cv_generator.title') }}>
                </h1>

          {/* Oferta Laboral */}

          <Separator />

          {/* Plantilla */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-700">{t('cv_generator.career.label')}</h2>
              {/* You can choose a different icon if Briefcase is not suitable */}
              <BriefcaseIcon className="w-5 h-5 text-gray-500" />
            </div>
            <Input
              type="text"
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              placeholder={t('cv_generator.career.placeholder')}
              className="bg-gray-50 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">{t('cv_generator.job_offer.label')}</h2>

            <div className="flex gap-2">
              {[
                { type: "pdf", icon: UploadIcon, label: t('cv_generator.job_offer.types.pdf') },
                { type: "image", icon: ImageIcon, label: t('cv_generator.job_offer.types.image') },
                { type: "text", icon: TextIcon, label: t('cv_generator.job_offer.types.text') },
              ].map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  type="button"
                  variant={ofertaType === type ? "default" : "outline"}
                  onClick={() => {
                    setOfertaType(type as any);
                    setOfertaLaboral(""); // Clear input when changing type
                  }}
                  className="flex-1 flex items-center justify-center gap-2 text-sm sm:text-base rounded-full transition-all duration-300"
                >
                  <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>
            {ofertaType === "text" ? (
              <Textarea
                value={ofertaLaboral as string} // Cast to string for Textarea
                onChange={(e) => setOfertaLaboral(e.target.value)}
                placeholder={t('cv_generator.job_offer.text_placeholder')}
                className="h-32 bg-gray-50 rounded-xl border-gray-200 focus:ring-blue-500"
                required
              />
            ) : (
              <Input
                type="file"
                accept={ofertaType === "pdf" ? ".pdf" : "image/*"}
                onChange={(e) => handleFileChange(e, setOfertaLaboral as any)} // Cast to any for File type
                className="bg-gray-50 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            )}
          </div>

          <Separator />

          {/* Plantilla */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">{t('cv_generator.template.label')}</h2>

{/*
            {templateId && (
              <div className="flex items-center p-2 bg-green-50 rounded-lg border border-green-200 mb-2">
                <Check className="text-green-500 mr-2 h-5 w-5" />
                <span className="text-sm text-green-700 font-medium">
                  {t('cv_generator.template.using_template')} <span className="font-bold">{selectedTemplateName}</span>
                </span>
                <Link href="/templates" className="ml-auto text-blue-600 text-sm hover:underline">
                  {t('cv_generator.template.change')}
                </Link>
              </div>
            )}

*/}

            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, setPlantillaCV, setPreviewTemplate)}
              className="bg-gray-50 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />


            {previewTemplate && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="mt-2 text-blue-600 hover:text-blue-800 flex items-center gap-2">
                    <Eye size={20} /> {t('cv_generator.template.preview')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{t('cv_generator.template.preview')}</DialogTitle>
                  </DialogHeader>
                  <iframe src={previewTemplate} className="w-full h-96 rounded-lg border" />
                </DialogContent>
              </Dialog>
            )}
            {!plantillaCV && !templateId && template && ( // Indicate which template is being used if none is uploaded
              <p className="text-sm text-gray-500 mt-2">{t('cv_generator.template.using_default')}</p>
            )}
            {plantillaCV && templateId && (
              <p className="text-sm text-amber-500 mt-2">{t('cv_generator.template.template_override')}</p>
            )}
          </div>

          <Separator />

          {/* Información Adicional */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">{t('cv_generator.additional_info.label')}</h2>
            <Textarea
              value={informacion}
              onChange={(e) => setInformacion(e.target.value)}
              placeholder={t('cv_generator.additional_info.placeholder')}
              className="h-24 bg-gray-50 rounded-xl border-gray-200 focus:ring-blue-500"
            />
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            disabled={isLoading || (ofertaType === 'text' && !ofertaLaboral) || (ofertaType !== 'text' && !ofertaLaboral)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                {t('cv_generator.buttons.generating')}
              </span>
            ) : (
              t('cv_generator.buttons.generate')
            )}
          </Button>
        </motion.form>

              {/* Vista Previa - Right Column */}
              <motion.div
                variants={fadeIn}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3 p-3 border-2 bg-white rounded-2xl shadow-xl flex flex-col"
              >
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('cv_generator.preview.title')}</h2>
                <div className="flex-grow rounded-lg overflow-hidden bg-gray-50">
                  {isLoading ? (
                    <CVSkeleton
                      progress={apiProgress}
                      isFirstApiDone={infoApiDone}
                      isSecondApiDone={templateApiDone}
                    />
                  ) : data ? (
                    <ShowHtml html={data.html} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                      <ImageIcon size={48} className="mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">{t('cv_generator.preview.placeholder.title')}</p>
                      <p className="text-sm">{t('cv_generator.preview.placeholder.description')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* CV Analysis Tab */}
          <TabsContent value="analyze" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Analysis Form - Left Column */}
              <motion.form
                onSubmit={handleAnalyzeCV}
                variants={fadeIn}
                className="lg:col-span-2 p-6 sm:p-8 bg-white border-2 rounded-2xl shadow-xl space-y-6 h-fit"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    {t('cv_analysis.title')}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {t('cv_analysis.subtitle')}
                  </p>
                </div>

                {/* Job Title */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-700">{t('cv_analysis.job_title_label')}</h2>
                    <BriefcaseIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <Input
                    type="text"
                    value={analysisFormData.jobTitle}
                    onChange={(e) => setAnalysisFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder={t('cv_analysis.job_title_placeholder')}
                    className="bg-gray-50 rounded-xl border-gray-200"
                    required
                  />
                </div>

                <Separator />

                {/* Industry */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-700">{t('cv_analysis.industry_label')}</h2>
                    <BriefcaseIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <Input
                    type="text"
                    value={analysisFormData.industry}
                    onChange={(e) => setAnalysisFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder={t('cv_analysis.industry_placeholder')}
                    className="bg-gray-50 rounded-xl border-gray-200"
                    required
                  />
                </div>

                <Separator />

                {/* CV File Upload */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700">{t('cv_analysis.upload_label')}</h2>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setAnalysisFormData(prev => ({ ...prev, cvFile: file }));
                    }}
                    className="bg-gray-50 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {t('cv_analysis.upload_description')}
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={analysisState.isAnalyzing || !analysisFormData.jobTitle || !analysisFormData.industry || !analysisFormData.cvFile}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analysisState.isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      {t('cv_analysis.analyzing_progress', { progress: analysisState.progress })}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FileSearch className="w-5 h-5" />
                      {t('cv_analysis.analyze_button')}
                    </span>
                  )}
                </Button>
              </motion.form>

              {/* Analysis Results - Right Column */}
              <motion.div
                variants={fadeIn}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3 p-3 border-2 bg-white rounded-2xl shadow-xl flex flex-col"
              >
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('cv_analysis.results_title')}</h2>
                <div className="flex-grow rounded-lg overflow-hidden bg-gray-50">
                  {analysisState.isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                      <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
                      <p className="text-lg font-medium text-gray-700 mb-2">{t('cv_analysis.analyzing')}</p>
                      <p className="text-sm text-gray-500 mb-4">{t('cv_analysis.ready_description')}</p>
                      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 relative overflow-hidden">
                        <div 
                          className={`bg-purple-600 h-2 rounded-full transition-all duration-300 absolute left-0 top-0`}
                          style={{ 
                            width: `${Math.min(100, Math.max(0, analysisState.progress))}%`,
                            transform: 'translateZ(0)' // Force hardware acceleration
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{analysisState.progress}% complete</p>
                    </div>
                  ) : analysisState.result ? (
                    <div className="h-full overflow-auto p-4">
                      <AnalysisResults result={analysisState.result} />
                    </div>
                  ) : analysisState.error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-red-500 p-4">
                      <FileSearch size={48} className="mb-4 text-red-400" />
                      <p className="text-lg font-medium mb-2">{t('cv_analysis.analysis_failed')}</p>
                      <p className="text-sm">{analysisState.error}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                      <FileSearch size={48} className="mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">{t('cv_analysis.ready_to_analyze')}</p>
                      <p className="text-sm">{t('cv_analysis.ready_description')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.main>
    </div>
  )
}