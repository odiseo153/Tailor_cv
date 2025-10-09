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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  CheckIcon, 
  Loader2, 
  Link as LinkIcon,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  AlertCircle
} from "lucide-react";
import { Message } from "@/app/utils/Message";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// TypeScript interfaces
interface SocialLink {
  id: string;
  platform: string;
  url: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SocialLinkFormData {
  platform: string;
  url: string;
}

interface SocialLinkErrors {
  platform?: string;
  url?: string;
  general?: string;
}

interface SocialLinksProps {
  className?: string;
}

interface FormFieldProps {
  id: string;
  name: keyof SocialLinkFormData;
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

// Social platform configuration
const socialPlatforms = [
  { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4 mr-2" />, color: "#0A66C2", urlPattern: "linkedin.com" },
  { value: "github", label: "GitHub", icon: <Github className="h-4 w-4 mr-2" />, color: "#181717", urlPattern: "github.com" },
  { value: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4 mr-2" />, color: "#1DA1F2", urlPattern: "twitter.com" },
  { value: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4 mr-2" />, color: "#E4405F", urlPattern: "instagram.com" },
  { value: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4 mr-2" />, color: "#1877F2", urlPattern: "facebook.com" },
  { value: "youtube", label: "YouTube", icon: <Youtube className="h-4 w-4 mr-2" />, color: "#FF0000", urlPattern: "youtube.com" },
  { value: "other", label: "Otro", icon: <Globe className="h-4 w-4 mr-2" />, color: "#718096", urlPattern: "" }
];

// Utility functions
const getPlatformIcon = (platform: string) => {
  const platformInfo = socialPlatforms.find(p => 
    p.value.toLowerCase() === platform.toLowerCase() || 
    p.label.toLowerCase() === platform.toLowerCase()
  );
  return platformInfo?.icon || <Globe className="h-4 w-4 mr-2" />;
};

const detectPlatformFromUrl = (url: string): string => {
  const lowerUrl = url.toLowerCase();
  for (const platform of socialPlatforms) {
    if (platform.urlPattern && lowerUrl.includes(platform.urlPattern)) {
      return platform.value;
    }
  }
  return "other";
};

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
  const stableKey = `social-${name}-${id}`;
  
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

FormField.displayName = 'SocialLinkFormField';

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

LoadingCard.displayName = 'SocialLinkLoadingCard';

// Memoized EmptyState component
const EmptyState = memo<{ onAdd: () => void }>(({ onAdd }) => (
  <div className="text-center py-8 bg-muted/30 rounded-lg">
    <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
    <p className="text-muted-foreground">No has agregado enlaces sociales todavía.</p>
    <Button 
      onClick={onAdd} 
      variant="outline" 
      className="mt-4"
    >
      <Plus className="h-4 w-4 mr-2" />
      Añadir primer enlace social
    </Button>
  </div>
));

EmptyState.displayName = 'SocialLinkEmptyState';

// Memoized SocialLinkItem component
const SocialLinkItem = memo<{
  link: SocialLink;
  isEditing: boolean;
  isLoading: boolean;
  formData: SocialLinkFormData;
  errors: SocialLinkErrors;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPlatformChange: (value: string) => void;
}>(({
  link,
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
  onPlatformChange
}) => {
  const platformInfo = useMemo(() => 
    socialPlatforms.find(p => p.value === link.platform) || socialPlatforms[socialPlatforms.length - 1],
    [link.platform]
  );

  const formFields = useMemo(() => [
    {
      id: `url-${link.id}`,
      name: "url" as const,
      label: "URL",
      placeholder: "https://ejemplo.com/mi-perfil",
      required: true,
      value: formData.url,
      error: errors.url,
      icon: <LinkIcon className="h-4 w-4" />
    }
  ], [link.id, formData, errors]);

  return (
    <motion.div
      key={link.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border",
        isEditing 
          ? "bg-muted/50 border-primary/20" 
          : "bg-card hover:bg-muted/30"
      )}
    >
      {isEditing ? (
        <div className="flex-1 space-y-4">
          {errors.general && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor={`platform-${link.id}`} className="text-sm font-medium">
              Plataforma *
            </Label>
            <Select 
              onValueChange={onPlatformChange} 
              value={formData.platform || ""}
            >
              <SelectTrigger className={errors.platform ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecciona una plataforma" />
              </SelectTrigger>
              <SelectContent>
                {socialPlatforms.map(platform => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center">
                      {platform.icon}
                      {platform.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-destructive text-sm">{errors.platform}</p>
            )}
          </div>
          
          {formFields.map((field) => (
            <FormField
              key={field.id}
              {...field}
              disabled={isLoading}
              onChange={onFormChange}
              onBlur={onFormBlur}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {platformInfo.icon}
              <span className="font-medium">{platformInfo.label}</span>
            </div>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Ver perfil
              <ExternalLink className="h-3 w-3" />
            </a>
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
        )}
      </div>
    </motion.div>
  );
});

SocialLinkItem.displayName = 'SocialLinkItem';

// Main SocialLinks component with comprehensive optimizations
const SocialLinks = memo<SocialLinksProps>(({ className }) => {
  const { data: session, status, update } = useSession() as {
    data: Session | null;
    status: string;
    update: (data: Partial<Session["user"]>) => Promise<Session | null>;
  };

  // State management
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SocialLinkFormData>({
    platform: "",
    url: ""
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<SocialLinkErrors>({});

  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  // Memoized initial form data
  const initialFormData = useMemo(() => ({
    platform: "",
    url: ""
  }), []);

  // Optimized data fetching
  const getSocialLinksData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/apiHandler/social/user/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSocialLinks(data.socialLinks || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
      Message.errorMessage("Error al cargar enlaces sociales");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Effects
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      getSocialLinksData();
    }
  }, [status, session, getSocialLinksData]);

  // Form validation
  const validateForm = useCallback((data: SocialLinkFormData): boolean => {
    const newErrors: SocialLinkErrors = {};

    if (!data.platform) {
      newErrors.platform = "La plataforma es requerida";
    }

    if (!data.url) {
      newErrors.url = "La URL es requerida";
    } else {
      try {
        new URL(data.url);
        if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
          newErrors.url = "La URL debe comenzar con http:// o https://";
        }
      } catch (e) {
        newErrors.url = "Por favor, introduce una URL válida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // Optimized form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof SocialLinkFormData;
    
    // Auto-detect platform from URL
    if (name === "url" && !formData.platform) {
      const detectedPlatform = detectPlatformFromUrl(value);
      setFormData(prev => ({
        ...prev,
        [fieldName]: value,
        platform: detectedPlatform
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
    
    // Clear field-specific error
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors, formData.platform]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const fieldName = name as keyof SocialLinkFormData;
    
    // Validate single field on blur
    const tempData = { ...formData, [fieldName]: e.target.value };
    const fieldErrors: SocialLinkErrors = {};
    
    if (fieldName === 'url') {
      if (!tempData.url) {
        fieldErrors.url = "La URL es requerida";
      } else {
        try {
          new URL(tempData.url);
          if (!tempData.url.startsWith('http://') && !tempData.url.startsWith('https://')) {
            fieldErrors.url = "La URL debe comenzar con http:// o https://";
          }
        } catch (e) {
          fieldErrors.url = "Por favor, introduce una URL válida";
        }
      }
    }
    
    if (fieldErrors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors[fieldName]
      }));
    }
  }, [formData]);

  const handlePlatformChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      platform: value
    }));
    
    if (errors.platform) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.platform;
        return newErrors;
      });
    }
  }, [errors.platform]);

  // CRUD operations
  const addSocialLink = useCallback(async () => {
    if (!validateForm(formData) || !session?.user?.id) {
      return;
    }

    setRefreshing(true);
    setErrors({});
    
    try {
      const linkData = {
        ...formData,
        userId: session.user.id
      };

      const response = await fetch("/api/apiHandler/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      const newLink = data.resultado.data;
      
      setSocialLinks(prev => [...prev, newLink]);
      Message.successMessage("Enlace social añadido correctamente");
      
      setFormData(initialFormData);
      setIsAddDialogOpen(false);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Error al añadir enlace social";
      setErrors({ general: errorMessage });
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [formData, session?.user?.id, validateForm, initialFormData]);

  const updateSocialLink = useCallback(async (id: string) => {
    if (!validateForm(formData)) {
      return;
    }

    setRefreshing(true);
    setErrors({});
    
    try {
      const linkData = {
        ...formData,
        userId: session?.user?.id
      };

      const response = await fetch(`/api/apiHandler/social/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      const updatedLink = data.resultado.data;
      
      setSocialLinks(prev => prev.map(link => 
        link.id === id ? updatedLink : link
      ));
      
      Message.successMessage("Enlace social actualizado correctamente");
      setEditingId(null);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar enlace social";
      setErrors({ general: errorMessage });
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [formData, validateForm, session?.user?.id]);

  const deleteSocialLink = useCallback(async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este enlace social?")) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const response = await fetch(`/api/apiHandler/social/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar enlace social");
      }

      setSocialLinks(prev => prev.filter(link => link.id !== id));
      Message.successMessage("Enlace social eliminado correctamente");
      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al eliminar enlace social");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // UI interaction handlers
  const handleEdit = useCallback((link: SocialLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      url: link.url
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

  // Memoized sorted links
  const sortedLinks = useMemo(() => {
    return [...socialLinks].sort((a, b) => a.platform.localeCompare(b.platform));
  }, [socialLinks]);

  // Form fields for add dialog
  const addFormFields = useMemo(() => [
    {
      id: "add-url",
      name: "url" as const,
      label: "URL",
      placeholder: "https://ejemplo.com/mi-perfil",
      required: true,
      value: formData.url,
      error: errors.url,
      icon: <LinkIcon className="h-4 w-4" />
    }
  ], [formData, errors]);

  // Loading state
  if (loading) {
    return <LoadingCard title="Enlaces Sociales" />;
  }

  return (
    <Card className={cn("bg-card border transition-all duration-300 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Enlaces Sociales</CardTitle>
        
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
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Añadir Enlace Social</DialogTitle>
            </DialogHeader>
            
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            <form ref={formRef} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-platform" className="text-sm font-medium">
                  Plataforma *
                </Label>
                <Select 
                  onValueChange={handlePlatformChange} 
                  value={formData.platform || ""}
                >
                  <SelectTrigger className={errors.platform ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona una plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {socialPlatforms.map(platform => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center">
                          {platform.icon}
                          {platform.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-destructive text-sm">{errors.platform}</p>
                )}
              </div>
              
              {addFormFields.map((field) => (
                <FormField
                  key={field.id}
                  {...field}
                  disabled={refreshing}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              ))}
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
                onClick={addSocialLink} 
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
        {socialLinks.length === 0 ? (
          <EmptyState onAdd={handleOpenAddDialog} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sortedLinks.map((link) => (
                <SocialLinkItem
                  key={link.id}
                  link={link}
                  isEditing={editingId === link.id}
                  isLoading={refreshing}
                  formData={formData}
                  errors={errors}
                  onEdit={() => handleEdit(link)}
                  onCancel={handleCancel}
                  onSave={() => updateSocialLink(link.id)}
                  onDelete={() => deleteSocialLink(link.id)}
                  onFormChange={handleInputChange}
                  onFormBlur={handleInputBlur}
                  onPlatformChange={handlePlatformChange}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SocialLinks.displayName = 'SocialLinks';

export default SocialLinks; 