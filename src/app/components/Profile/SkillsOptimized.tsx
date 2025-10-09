"use client"

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { Session } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Pencil, Trash2, X, CheckIcon, Loader2, LightbulbIcon, StarIcon, AlertCircle } from "lucide-react";
import { Message } from "@/app/utils/Message";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/app/context/I18nContext";

// TypeScript interfaces
interface Skill {
  id: string;
  name: string;
  level: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SkillFormData {
  name: string;
  level: number;
}

interface SkillErrors {
  name?: string;
  level?: string;
  general?: string;
}

interface SkillProps {
  className?: string;
}

interface FormFieldProps {
  id: string;
  name: keyof SkillFormData;
  label: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | number[]) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
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
  min,
  max,
  step,
  showSlider = false
}) => {
  const stableKey = `skill-${name}-${id}`;
  
  const renderStars = useCallback((level: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={cn(
          "h-3 w-3",
          index < level ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  }, []);

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
        {label} {showSlider && `(${value}/5)`}
      </Label>
      
      {showSlider ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {renderStars(Number(value))}
            </div>
            <span className="text-sm text-muted-foreground">{value}/5</span>
          </div>
          <Slider 
            id={id}
            value={[Number(value)]} 
            max={5} 
            min={1} 
            step={1} 
            onValueChange={(values) => onChange(values)}
            disabled={disabled}
            className={cn(
              "transition-all duration-200",
              error ? "border-destructive" : ""
            )}
          />
        </div>
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
          min={min}
          max={max}
          step={step}
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

FormField.displayName = 'SkillFormField';

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

LoadingCard.displayName = 'SkillLoadingCard';

// Memoized EmptyState component
const EmptyState = memo<{ onAdd: () => void; t: any }>(({ onAdd, t }) => (
  <div className="text-center py-8 bg-muted/30 rounded-lg">
    <LightbulbIcon className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
    <p className="text-muted-foreground">{t('profile.skills.no_skills')}</p>
    <Button 
      onClick={onAdd} 
      variant="outline" 
      className="mt-4"
    >
      <Plus className="h-4 w-4 mr-2" />
      {t('profile.skills.add_first')}
    </Button>
  </div>
));

EmptyState.displayName = 'SkillEmptyState';

// Memoized SkillItem component
const SkillItem = memo<{
  skill: Skill;
  isEditing: boolean;
  isLoading: boolean;
  formData: SkillFormData;
  errors: SkillErrors;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement> | number[]) => void;
  onFormBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  t: any;
}>(({
  skill,
  isEditing,
  isLoading,
  formData,
  errors,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onFormChange,
  onFormBlur,
  t
}) => {
  const renderStars = useCallback((level: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={cn(
          "h-3 w-3",
          index < level ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  }, []);

  const formFields = useMemo(() => [
    {
      id: `name-${skill.id}`,
      name: "name" as const,
      label: t('profile.skills.skill_name'),
      placeholder: t('profile.skills.skill_placeholder'),
      required: true,
      value: formData.name,
      error: errors.name
    },
    {
      id: `level-${skill.id}`,
      name: "level" as const,
      label: t('profile.skills.level'),
      value: formData.level,
      error: errors.level,
      showSlider: true
    }
  ], [skill.id, formData, errors, t]);

  return (
    <motion.div
      key={skill.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex justify-between items-center p-3 rounded-lg border",
        isEditing 
          ? "bg-muted/50 border-primary/20" 
          : "bg-card hover:bg-muted/30"
      )}
    >
      {isEditing ? (
        <div className="flex-1">
          {errors.general && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {formFields.map((field) => (
              <FormField
                key={field.id}
                {...field}
                disabled={isLoading}
                onChange={onFormChange}
                onBlur={field.showSlider ? undefined : onFormBlur}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {skill.level >= 4 && (
              <Badge className="bg-primary/10 text-primary text-xs">
                {t('profile.skills.featured')}
              </Badge>
            )}
            <span className="font-medium">{skill.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex">
              {renderStars(skill.level)}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-1 ml-2">
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
                  <p>{t('profile.personal_info.cancel')}</p>
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
                  <p>{t('profile.personal_info.save')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <div className="flex gap-1">
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
                  <p>{t('profile.skills.edit')}</p>
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
                  <p>{t('profile.skills.delete')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </motion.div>
  );
});

SkillItem.displayName = 'SkillItem';

// Main Skills component with comprehensive optimizations
const Skills = memo<SkillProps>(({ className }) => {
  const { t } = useI18n();
  const { data: session, status, update } = useSession() as {
    data: Session | null;
    status: string;
    update: (data: Partial<Session["user"]>) => Promise<Session | null>;
  };

  // State management
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SkillFormData>({
    name: "",
    level: 1
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<SkillErrors>({});

  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  // Memoized initial form data
  const initialFormData = useMemo(() => ({
    name: "",
    level: 1
  }), []);

  // Optimized data fetching
  const getSkillsData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/apiHandler/skill/user/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      Message.errorMessage(t('profile.skills.error_loading'));
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, t]);

  // Effects
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      getSkillsData();
    }
  }, [status, session, getSkillsData]);

  // Form validation
  const validateForm = useCallback((data: SkillFormData): boolean => {
    const newErrors: SkillErrors = {};

    if (!data.name || data.name.trim() === '') {
      newErrors.name = t('profile.skills.name_required');
    }
    
    if (!data.level) {
      newErrors.level = t('profile.skills.level_required');
    } else if (data.level < 1 || data.level > 5) {
      newErrors.level = t('profile.skills.level_range');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [t]);

  // Optimized form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | number[]) => {
    if (Array.isArray(e)) {
      // Slider change
      setFormData(prev => ({ ...prev, level: e[0] }));
      
      if (errors.level) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.level;
          return newErrors;
        });
      }
    } else {
      // Input change
      const { name, value } = e.target;
      const fieldName = name as keyof SkillFormData;
      
      setFormData(prev => ({ ...prev, [fieldName]: value }));
      
      if (errors[fieldName]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  }, [errors]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const fieldName = name as keyof SkillFormData;
    
    // Validate single field on blur
    const tempData = { ...formData, [fieldName]: e.target.value };
    const fieldErrors: SkillErrors = {};
    
    if (fieldName === 'name' && (!tempData.name || tempData.name.trim() === '')) {
      fieldErrors.name = t('profile.skills.name_required');
    }
    
    if (fieldErrors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors[fieldName]
      }));
    }
  }, [formData, t]);

  // CRUD operations
  const addSkill = useCallback(async () => {
    if (!validateForm(formData) || !session?.user?.id) {
      return;
    }

    setRefreshing(true);
    setErrors({});
    
    try {
      const skillData = {
        ...formData,
        userId: session.user.id
      };

      const res = await fetch("/api/apiHandler/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error: ${res.status}`);
      }
      
      const data = await res.json();
      const newSkill = data.resultado.data;
      
      setSkills(prev => [...prev, newSkill]);
      Message.successMessage(t('profile.skills.added_successfully'));
      
      setFormData(initialFormData);
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : t('profile.skills.error_adding');
      setErrors({ general: errorMessage });
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [formData, session?.user?.id, validateForm, initialFormData, t]);

  const updateSkill = useCallback(async (id: string) => {
    if (!validateForm(formData)) {
      return;
    }

    setRefreshing(true);
    setErrors({});
    
    try {
      const res = await fetch(`/api/apiHandler/skill/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error: ${res.status}`);
      }
      
      const data = await res.json();
      const updatedSkill = data.resultado.data;
      
      setSkills(prev => prev.map(skill => 
        skill.id === id ? updatedSkill : skill
      ));
      
      Message.successMessage(t('profile.skills.updated_successfully'));
      setEditingId(null);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : t('profile.skills.error_updating');
      setErrors({ general: errorMessage });
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [formData, validateForm, t]);

  const deleteSkill = useCallback(async (id: string) => {
    if (!confirm(t('profile.skills.confirm_delete'))) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const res = await fetch(`/api/apiHandler/skill/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        throw new Error(t('profile.skills.error_deleting'));
      }

      setSkills(prev => prev.filter(skill => skill.id !== id));
      Message.successMessage(t('profile.skills.deleted_successfully'));
      
    } catch (error) {
      console.error(error);
      Message.errorMessage(t('profile.skills.error_deleting'));
    } finally {
      setRefreshing(false);
    }
  }, [t]);

  // UI interaction handlers
  const handleEdit = useCallback((skill: Skill) => {
    setEditingId(skill.id);
    setFormData({
      name: skill.name,
      level: skill.level
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

  // Memoized sorted skills
  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level; // Higher level first
      }
      return a.name.localeCompare(b.name); // Then alphabetical
    });
  }, [skills]);

  // Form fields for add dialog
  const addFormFields = useMemo(() => [
    {
      id: "add-name",
      name: "name" as const,
      label: t('profile.skills.skill_name'),
      placeholder: t('profile.skills.skill_placeholder'),
      required: true,
      value: formData.name,
      error: errors.name
    },
    {
      id: "add-level",
      name: "level" as const,
      label: t('profile.skills.level'),
      value: formData.level,
      error: errors.level,
      showSlider: true
    }
  ], [formData, errors, t]);

  // Loading state
  if (loading) {
    return <LoadingCard title={t('profile.skills.title')} />;
  }

  return (
    <Card className={cn("bg-card border transition-all duration-300 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{t('profile.skills.title')}</CardTitle>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={handleOpenAddDialog}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('profile.skills.add')}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">{t('profile.skills.add_skill')}</DialogTitle>
            </DialogHeader>
            
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            <form ref={formRef} className="space-y-4">
              {addFormFields.map((field) => (
                <FormField
                  key={field.id}
                  {...field}
                  disabled={refreshing}
                  onChange={handleInputChange}
                  onBlur={field.showSlider ? undefined : handleInputBlur}
                />
              ))}
            </form>
            
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={refreshing}
              >
                {t('profile.skills.cancel')}
              </Button>
              <Button 
                onClick={addSkill} 
                disabled={refreshing}
                className="bg-primary hover:bg-primary/90"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('profile.skills.saving')}
                  </>
                ) : (
                  t('profile.skills.save')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {skills.length === 0 ? (
          <EmptyState onAdd={handleOpenAddDialog} t={t} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sortedSkills.map((skill) => (
                <SkillItem
                  key={skill.id}
                  skill={skill}
                  isEditing={editingId === skill.id}
                  isLoading={refreshing}
                  formData={formData}
                  errors={errors}
                  onEdit={() => handleEdit(skill)}
                  onCancel={handleCancel}
                  onSave={() => updateSkill(skill.id)}
                  onDelete={() => deleteSkill(skill.id)}
                  onFormChange={handleInputChange}
                  onFormBlur={handleInputBlur}
                  t={t}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

Skills.displayName = 'Skills';

export default Skills; 