"use client"

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { Session } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  CheckIcon, 
  Loader2, 
  GraduationCap,
  CalendarIcon,
  AlertCircle
} from "lucide-react";
import { Message } from "@/app/utils/Message";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// TypeScript interfaces
interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface EducationFormData {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface EducationErrors {
  institution?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
  general?: string;
}

interface EducationInfoProps {
  className?: string;
}

interface FormFieldProps {
  id: string;
  name: keyof EducationFormData;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  icon?: React.ReactNode;
}

// Memoized FormField component
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
  onChange,
  onBlur,
  className,
  icon
}) => {
  const stableKey = `education-${name}-${id}`;
  
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
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
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
            icon && "pl-9",
            error ? "border-destructive ring-destructive focus:border-destructive focus:ring-destructive" : "",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
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

FormField.displayName = 'EducationFormField';

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

LoadingCard.displayName = 'EducationLoadingCard';

// Memoized EmptyState component
const EmptyState = memo<{ onAdd: () => void }>(({ onAdd }) => (
  <div className="text-center py-8 bg-muted/30 rounded-lg">
    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
    <p className="text-muted-foreground">No has agregado información educativa todavía.</p>
    <Button 
      onClick={onAdd} 
      variant="outline" 
      className="mt-4"
    >
      <Plus className="h-4 w-4 mr-2" />
      Añadir educación
    </Button>
  </div>
));

EmptyState.displayName = 'EducationEmptyState';

// Memoized EducationItem component
const EducationItem = memo<{
  education: Education;
  isEditing: boolean;
  isLoading: boolean;
  formData: EducationFormData;
  errors: EducationErrors;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}>(({
  education,
  isEditing,
  isLoading,
  formData,
  errors,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onFormChange,
  onFormBlur
}) => {
  const formatDateDisplay = useCallback((dateString: string | null) => {
    if (!dateString) return "Presente";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short'
    });
  }, []);

  const formFields = useMemo(() => [
    {
      id: `institution-${education.id}`,
      name: "institution" as const,
      label: "Institución/Universidad",
      placeholder: "Universidad / Instituto",
      required: true,
      value: formData.institution,
      error: errors.institution,
      icon: <GraduationCap className="h-4 w-4" />
    },
    {
      id: `degree-${education.id}`,
      name: "degree" as const,
      label: "Título/Grado",
      placeholder: "Licenciatura, Maestría, Doctorado, etc.",
      required: true,
      value: formData.degree,
      error: errors.degree
    },
    {
      id: `startDate-${education.id}`,
      name: "startDate" as const,
      label: "Fecha de inicio",
      type: "date",
      required: true,
      value: formData.startDate,
      error: errors.startDate
    },
    {
      id: `endDate-${education.id}`,
      name: "endDate" as const,
      label: "Fecha de fin",
      type: "date",
      placeholder: "Dejar vacío si es actual",
      value: formData.endDate,
      error: errors.endDate
    }
  ], [education.id, formData, errors]);

  return (
    <motion.div
      key={education.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-4 rounded-lg border",
        isEditing 
          ? "bg-muted/50 border-primary/20" 
          : "bg-card hover:bg-muted/30"
      )}
    >
      {isEditing ? (
        <div className="space-y-4">
          {errors.general && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            {formFields.slice(0, 2).map((field) => (
              <FormField
                key={field.id}
                {...field}
                disabled={isLoading}
                onChange={onFormChange}
                onBlur={onFormBlur}
              />
            ))}
            
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
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancelar edición</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={onSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Guardar
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Guardar cambios</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-lg">{education.degree}</h3>
            <p className="text-muted-foreground">{education.institution}</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDateDisplay(education.startDate)} - {formatDateDisplay(education.endDate)}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
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
          </div>
        </div>
      )}
    </motion.div>
  );
});

EducationItem.displayName = 'EducationItem';

// Main EducationInfo component with comprehensive optimizations
const EducationInfo = memo<EducationInfoProps>(({ className }) => {
  const { data: session, status, update } = useSession() as {
    data: Session | null;
    status: string;
    update: (data: Partial<Session["user"]>) => Promise<Session | null>;
  };

  // State management
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EducationFormData>({
    institution: "",
    degree: "",
    startDate: "",
    endDate: ""
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<EducationErrors>({});

  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  // Memoized initial form data
  const initialFormData = useMemo(() => ({
    institution: "",
    degree: "",
    startDate: "",
    endDate: ""
  }), []);

  // Optimized data fetching
  const getEducationData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/apiHandler/education/user/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEducationList(data.education || []);
    } catch (error) {
      console.error('Error fetching education data:', error);
      Message.errorMessage("Error al cargar información educativa");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Effects
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      getEducationData();
    }
  }, [status, session, getEducationData]);

  // Form validation
  const validateForm = useCallback((data: EducationFormData): boolean => {
    const newErrors: EducationErrors = {};

    if (!data.institution?.trim()) {
      newErrors.institution = "La institución es requerida";
    }

    if (!data.degree?.trim()) {
      newErrors.degree = "El título o grado es requerido";
    }

    if (!data.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    }

    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (endDate < startDate) {
        newErrors.endDate = "La fecha de finalización debe ser posterior a la fecha de inicio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // Optimized form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof EducationFormData;
    
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

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const fieldName = name as keyof EducationFormData;
    
    // Validate single field on blur
    const tempData = { ...formData, [fieldName]: e.target.value };
    const fieldErrors: EducationErrors = {};
    
    if (fieldName === 'institution' && !tempData.institution?.trim()) {
      fieldErrors.institution = "La institución es requerida";
    } else if (fieldName === 'degree' && !tempData.degree?.trim()) {
      fieldErrors.degree = "El título o grado es requerido";
    } else if (fieldName === 'startDate' && !tempData.startDate) {
      fieldErrors.startDate = "La fecha de inicio es requerida";
    } else if (fieldName === 'endDate' && tempData.startDate && tempData.endDate) {
      const startDate = new Date(tempData.startDate);
      const endDate = new Date(tempData.endDate);
      if (endDate < startDate) {
        fieldErrors.endDate = "La fecha de finalización debe ser posterior a la fecha de inicio";
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
  const addEducation = useCallback(async () => {
    if (!validateForm(formData) || !session?.user?.id) {
      return;
    }

    setRefreshing(true);
    setErrors({});
    
    try {
      const educationData = {
        ...formData,
        userId: session.user.id
      };

      const response = await fetch("/api/apiHandler/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(educationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      const newEducation = data.resultado.data;
      
      setEducationList(prev => [...prev, newEducation]);
      Message.successMessage("Información educativa añadida correctamente");
      
      setFormData(initialFormData);
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Error al añadir información educativa";
      setErrors({ general: errorMessage });
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [formData, session?.user?.id, validateForm, initialFormData]);

  const updateEducation = useCallback(async (id: string) => {
    if (!validateForm(formData)) {
      return;
    }

    setRefreshing(true);
    setErrors({});
    
    try {
      const educationData = {
        ...formData,
        userId: session?.user?.id
      };

      const response = await fetch(`/api/apiHandler/education/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(educationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      const updatedEducation = data.resultado.data;
      
      setEducationList(prev => prev.map(edu => 
        edu.id === id ? updatedEducation : edu
      ));
      
      Message.successMessage("Información educativa actualizada correctamente");
      setEditingId(null);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar información educativa";
      setErrors({ general: errorMessage });
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [formData, validateForm, session?.user?.id]);

  const deleteEducation = useCallback(async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta información educativa?")) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const response = await fetch(`/api/apiHandler/education/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar información educativa");
      }

      setEducationList(prev => prev.filter(edu => edu.id !== id));
      Message.successMessage("Información educativa eliminada correctamente");
      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al eliminar información educativa");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // UI interaction handlers
  const handleEdit = useCallback((education: Education) => {
    setEditingId(education.id);
    setFormData({
      institution: education.institution,
      degree: education.degree,
      startDate: education.startDate,
      endDate: education.endDate || ""
    });
    setErrors({});
  }, []);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  const handleOpenAddDialog = useCallback(() => {
    setEditingId(null);
    setFormData(initialFormData);
    setErrors({});
    setIsAddDialogOpen(true);
  }, [initialFormData]);

  // Memoized sorted education
  const sortedEducation = useMemo(() => {
    return [...educationList].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [educationList]);

  // Form fields for add dialog
  const addFormFields = useMemo(() => [
    {
      id: "add-institution",
      name: "institution" as const,
      label: "Institución/Universidad",
      placeholder: "Universidad / Instituto",
      required: true,
      value: formData.institution,
      error: errors.institution,
      icon: <GraduationCap className="h-4 w-4" />
    },
    {
      id: "add-degree",
      name: "degree" as const,
      label: "Título/Grado",
      placeholder: "Licenciatura, Maestría, Doctorado, etc.",
      required: true,
      value: formData.degree,
      error: errors.degree
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
    }
  ], [formData, errors]);

  // Loading state
  if (loading) {
    return <LoadingCard title="Educación" />;
  }

  return (
    <Card className={cn("bg-card border transition-all duration-300 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Educación</CardTitle>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={handleOpenAddDialog}
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Añadir Educación</DialogTitle>
            </DialogHeader>
            
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            <form ref={formRef} className="space-y-4">
              {addFormFields.slice(0, 2).map((field) => (
                <FormField
                  key={field.id}
                  {...field}
                  disabled={refreshing}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              ))}
              
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
                onClick={addEducation} 
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
        {educationList.length === 0 ? (
          <EmptyState onAdd={handleOpenAddDialog} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sortedEducation.map((education) => (
                <EducationItem
                  key={education.id}
                  education={education}
                  isEditing={editingId === education.id}
                  isLoading={refreshing}
                  formData={formData}
                  errors={errors}
                  onEdit={() => handleEdit(education)}
                  onCancel={handleCancel}
                  onSave={() => updateEducation(education.id)}
                  onDelete={() => deleteEducation(education.id)}
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

EducationInfo.displayName = 'EducationInfo';

export default EducationInfo; 