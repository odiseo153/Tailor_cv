"use client"

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Plus, Trash2, X, CheckIcon, Loader2, CalendarIcon, Briefcase, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Message } from "@/app/utils/Message";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// TypeScript interfaces
interface WorkExperience {
  id: string;
  company: string;
  jobTitle: string;
  userId: string;
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkExperienceFormData {
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface WorkExperienceErrors {
  company?: string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  general?: string;
}

interface FormFieldProps {
  id: string;
  name: keyof WorkExperienceFormData;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
}

interface WorkExperienceProps {
  className?: string;
}

// Memoized FormField component to prevent unnecessary re-renders
const FormField = memo<FormFieldProps>(({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  error,
  disabled = false,
  required = false,
  rows,
  onChange,
  onBlur,
  className
}) => {
  const stableKey = `work-${name}-${id}`;
  
  return (
    <div className={cn("space-y-2", className)} key={stableKey}>
      <Label 
        htmlFor={id} 
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          error ? "text-destructive" : "text-foreground",
          required && "after:content-['*'] after:ml-1 after:text-destructive"
        )}
      >
        {label}
      </Label>
      {rows ? (
        <Textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={cn(
            "transition-all duration-200",
            error ? "border-destructive ring-destructive focus:border-destructive focus:ring-destructive" : "",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "transition-all duration-200",
            error ? "border-destructive ring-destructive focus:border-destructive focus:ring-destructive" : "",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && (
        <p 
          id={`${id}-error`}
          className="text-destructive text-sm mt-1 animate-in slide-in-from-top-1 duration-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'WorkExperienceFormField';

// Memoized LoadingCard component
const LoadingCard = memo<{ title: string }>(({ title }) => (
  <Card className="bg-card border transition-all duration-300 hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </CardContent>
  </Card>
));

LoadingCard.displayName = 'WorkExperienceLoadingCard';

// Memoized EmptyState component
const EmptyState = memo<{ onAdd: () => void }>(({ onAdd }) => (
  <div className="text-center py-8 bg-muted/30 rounded-lg">
    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
    <p className="text-muted-foreground">No has agregado experiencias laborales todavía.</p>
    <Button 
      onClick={onAdd} 
      variant="outline" 
      className="mt-4"
    >
      <Plus className="h-4 w-4 mr-2" />
      Agregar primera experiencia
    </Button>
  </div>
));

EmptyState.displayName = 'WorkExperienceEmptyState';

// Memoized ExperienceItem component
const ExperienceItem = memo<{
  experience: WorkExperience;
  isEditing: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  formData: WorkExperienceFormData;
  errors: WorkExperienceErrors;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onToggleExpand: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}>(({
  experience,
  isEditing,
  isExpanded,
  isLoading,
  formData,
  errors,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onToggleExpand,
  onFormChange,
  onFormBlur
}) => {
  const formatDateDisplay = useCallback((dateString: string | undefined) => {
    if (!dateString) return "Presente";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short'
    });
  }, []);

  const formFields = useMemo(() => [
    {
      id: `company-${experience.id}`,
      name: "company" as const,
      label: "Empresa",
      placeholder: "Nombre de la empresa",
      required: true,
      value: formData.company,
      error: errors.company
    },
    {
      id: `jobTitle-${experience.id}`,
      name: "jobTitle" as const,
      label: "Puesto",
      placeholder: "Título del puesto",
      required: true,
      value: formData.jobTitle,
      error: errors.jobTitle
    },
    {
      id: `startDate-${experience.id}`,
      name: "startDate" as const,
      label: "Fecha de inicio",
      type: "date",
      required: true,
      value: formData.startDate,
      error: errors.startDate
    },
    {
      id: `endDate-${experience.id}`,
      name: "endDate" as const,
      label: "Fecha de fin",
      type: "date",
      placeholder: "Dejar vacío si es actual",
      value: formData.endDate,
      error: errors.endDate
    },
    {
      id: `description-${experience.id}`,
      name: "description" as const,
      label: "Descripción",
      placeholder: "Describe tus responsabilidades y logros",
      rows: 4,
      value: formData.description,
      error: errors.description
    }
  ], [experience.id, formData, errors]);

  return (
    <motion.div
      key={experience.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "border rounded-lg transition-all duration-200",
        isEditing 
          ? "bg-muted/50 border-primary/20" 
          : "bg-card hover:bg-muted/30"
      )}
    >
      <div className="p-4">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{experience.jobTitle}</h3>
              {!isEditing && !experience.endDate && (
                <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                  Actual
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{experience.company}</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDateDisplay(experience.startDate)} - {formatDateDisplay(experience.endDate)}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {isEditing ? (
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={onCancel}
                        disabled={isLoading}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cancelar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={onSave}
                        disabled={isLoading}
                        className="h-8 w-8"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Guardar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onEdit}
                        disabled={isLoading}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onDelete} 
                        disabled={isLoading}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Eliminar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onToggleExpand}
                        className="h-8 w-8"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isExpanded ? "Contraer" : "Expandir"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
        
        {/* Expandable Content */}
        <AnimatePresence>
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t"
            >
              {errors.general && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {formFields.slice(0, 2).map((field) => (
                    <FormField
                      key={field.id}
                      {...field}
                      disabled={isLoading}
                      onChange={onFormChange}
                      onBlur={onFormBlur}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formFields.slice(2, 4).map((field) => (
                    <FormField
                      key={field.id}
                      {...field}
                      disabled={isLoading}
                      onChange={onFormChange}
                      onBlur={onFormBlur}
                    />
                  ))}
                </div>
                <FormField
                  {...formFields[4]}
                  disabled={isLoading}
                  onChange={onFormChange}
                  onBlur={onFormBlur}
                />
              </div>
            </motion.div>
          ) : isExpanded && experience.description ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t"
            >
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {experience.description}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

ExperienceItem.displayName = 'WorkExperienceItem';

// Main WorkExperienceInfo component with comprehensive optimizations
const WorkExperienceInfo = memo<WorkExperienceProps>(({ className }) => {
  const { data: session, status, update } = useSession();
  
  // State management
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkExperienceFormData>({
    company: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<WorkExperienceErrors>({});
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  // Memoized initial form data
  const initialFormData = useMemo(() => ({
    company: "",
    jobTitle: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    description: ""
  }), []);

  // Optimized data fetching
  const getWorkData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/apiHandler/work/user/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setExperiences(data.experiences || []);
    } catch (error) {
      console.error('Error fetching work experience:', error);
      Message.errorMessage("Error al cargar experiencias laborales");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Effects
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      getWorkData();
    }
  }, [status, session, getWorkData]);

  // Form validation
  const validateForm = useCallback((data: WorkExperienceFormData): boolean => {
    const newErrors: WorkExperienceErrors = {};

    if (!data.company?.trim()) {
      newErrors.company = "La empresa es requerida";
    }

    if (!data.jobTitle?.trim()) {
      newErrors.jobTitle = "El puesto es requerido";
    }

    if (!data.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      
      if (end < start) {
        newErrors.endDate = "La fecha de fin no puede ser anterior a la fecha de inicio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // Optimized form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof WorkExperienceFormData;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear field-specific error
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    const fieldName = name as keyof WorkExperienceFormData;
    
    // Validate single field on blur
    const tempData = { ...formData, [fieldName]: e.target.value };
    const fieldErrors: WorkExperienceErrors = {};
    
    if (fieldName === 'company' && !tempData.company?.trim()) {
      fieldErrors.company = "La empresa es requerida";
    } else if (fieldName === 'jobTitle' && !tempData.jobTitle?.trim()) {
      fieldErrors.jobTitle = "El puesto es requerido";
    } else if (fieldName === 'startDate' && !tempData.startDate) {
      fieldErrors.startDate = "La fecha de inicio es requerida";
    } else if (fieldName === 'endDate' && tempData.startDate && tempData.endDate) {
      const start = new Date(tempData.startDate);
      const end = new Date(tempData.endDate);
      if (end < start) {
        fieldErrors.endDate = "La fecha de fin no puede ser anterior a la fecha de inicio";
      }
    }
    
    if (fieldErrors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors[fieldName]
      }));
    }
  }, [formData]);

  // CRUD operations
  const addExperience = useCallback(async () => {
    if (!validateForm(formData) || !session?.user?.id) {
      return;
    }

    setRefreshing(true);
    setErrors({});
    
    try {
      const experienceData = {
        ...formData,
        userId: session.user.id
      };

      const res = await fetch("/api/apiHandler/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: experienceData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error: ${res.status}`);
      }
      
      const data = await res.json();
      const newExperience = data.resultado.data;
      
      setExperiences(prev => [...prev, newExperience]);
      Message.successMessage("Experiencia agregada correctamente");
      
      setFormData(initialFormData);
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Error al agregar experiencia";
      setErrors({ general: errorMessage });
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [formData, session?.user?.id, validateForm, initialFormData]);

  const updateExperience = useCallback(async (id: string) => {
    if (!validateForm(formData)) {
      return;
    }

    setRefreshing(true);
    setErrors({});
    
    try {
      const res = await fetch(`/api/apiHandler/work/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error: ${res.status}`);
      }
      
      const data = await res.json();
      const updatedExperience = data.resultado.data;
      
      setExperiences(prev => prev.map(exp => 
        exp.id === id ? updatedExperience : exp
      ));
      
      Message.successMessage("Experiencia actualizada correctamente");
      setEditingId(null);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar experiencia";
      setErrors({ general: errorMessage });
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [formData, validateForm]);

  const deleteExperience = useCallback(async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta experiencia laboral?")) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const res = await fetch(`/api/apiHandler/work/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        throw new Error("Error al eliminar");
      }

      setExperiences(prev => prev.filter(exp => exp.id !== id));
      Message.successMessage("Experiencia eliminada correctamente");
      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al eliminar la experiencia");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // UI interaction handlers
  const handleEdit = useCallback((experience: WorkExperience) => {
    setEditingId(experience.id);
    setFormData({
      company: experience.company,
      jobTitle: experience.jobTitle,
      startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
      endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
      description: experience.description || ''
    });
    setErrors({});
    
    // Expand the item being edited
    if (!expandedItems.includes(experience.id)) {
      setExpandedItems(prev => [...prev, experience.id]);
    }
  }, [expandedItems]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  }, []);

  const handleOpenAddDialog = useCallback(() => {
    setEditingId(null);
    setFormData(initialFormData);
    setErrors({});
    setIsAddDialogOpen(true);
  }, [initialFormData]);

  // Form fields for add dialog
  const addFormFields = useMemo(() => [
    {
      id: "add-company",
      name: "company" as const,
      label: "Empresa",
      placeholder: "Nombre de la empresa",
      required: true,
      value: formData.company,
      error: errors.company
    },
    {
      id: "add-jobTitle",
      name: "jobTitle" as const,
      label: "Puesto",
      placeholder: "Título del puesto",
      required: true,
      value: formData.jobTitle,
      error: errors.jobTitle
    },
    {
      id: "add-startDate",
      name: "startDate" as const,
      label: "Fecha de inicio",
      type: "date",
      required: true,
      value: formData.startDate,
      error: errors.startDate
    },
    {
      id: "add-endDate",
      name: "endDate" as const,
      label: "Fecha de fin",
      type: "date",
      placeholder: "Dejar vacío si es actual",
      value: formData.endDate,
      error: errors.endDate
    },
    {
      id: "add-description",
      name: "description" as const,
      label: "Descripción",
      placeholder: "Describe tus responsabilidades y logros",
      rows: 4,
      value: formData.description,
      error: errors.description
    }
  ], [formData, errors]);

  // Loading state
  if (loading) {
    return <LoadingCard title="Experiencia Laboral" />;
  }

  return (
    <Card className={cn("bg-card border transition-all duration-300 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Experiencia Laboral</CardTitle>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={handleOpenAddDialog}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-xl">Agregar Experiencia Laboral</DialogTitle>
            
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            <form ref={formRef} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {addFormFields.slice(0, 2).map((field) => (
                  <FormField
                    key={field.id}
                    {...field}
                    disabled={refreshing}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addFormFields.slice(2, 4).map((field) => (
                  <FormField
                    key={field.id}
                    {...field}
                    disabled={refreshing}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                  />
                ))}
              </div>
              <FormField
                {...addFormFields[4]}
                disabled={refreshing}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
              />
            </form>
            
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={refreshing}
              >
                Cancelar
              </Button>
              <Button 
                onClick={addExperience} 
                disabled={refreshing}
                className="bg-primary hover:bg-primary/90"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {experiences.length === 0 ? (
          <EmptyState onAdd={handleOpenAddDialog} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {experiences.map((exp) => (
                <ExperienceItem
                  key={exp.id}
                  experience={exp}
                  isEditing={editingId === exp.id}
                  isExpanded={expandedItems.includes(exp.id)}
                  isLoading={refreshing}
                  formData={formData}
                  errors={errors}
                  onEdit={() => handleEdit(exp)}
                  onCancel={handleCancel}
                  onSave={() => updateExperience(exp.id)}
                  onDelete={() => deleteExperience(exp.id)}
                  onToggleExpand={() => handleToggleExpand(exp.id)}
                  onFormChange={handleInputChange}
                  onFormBlur={handleInputBlur}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

WorkExperienceInfo.displayName = 'WorkExperienceInfo';

export default WorkExperienceInfo; 