"use client"

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Session } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Globe
} from "lucide-react";
import { Message } from "@/app/utils/Message";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interfaz para enlaces sociales
interface SocialLink {
  id: string;
  platform: string;
  url: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Configuración de plataformas sociales
const socialPlatforms = [
  { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4 mr-2" />, color: "#0A66C2", urlPattern: "linkedin.com" },
  { value: "github", label: "GitHub", icon: <Github className="h-4 w-4 mr-2" />, color: "#181717", urlPattern: "github.com" },
  { value: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4 mr-2" />, color: "#1DA1F2", urlPattern: "twitter.com" },
  { value: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4 mr-2" />, color: "#E4405F", urlPattern: "instagram.com" },
  { value: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4 mr-2" />, color: "#1877F2", urlPattern: "facebook.com" },
  { value: "youtube", label: "YouTube", icon: <Youtube className="h-4 w-4 mr-2" />, color: "#FF0000", urlPattern: "youtube.com" },
  { value: "other", label: "Otro", icon: <Globe className="h-4 w-4 mr-2" />, color: "#718096", urlPattern: "" }
];

// Función para obtener el icono de una plataforma
const getPlatformIcon = (platform: string) => {
  const platformInfo = socialPlatforms.find(p => 
    p.value.toLowerCase() === platform.toLowerCase() || 
    p.label.toLowerCase() === platform.toLowerCase()
  );
  
  return platformInfo?.icon || <Globe className="h-4 w-4 mr-2" />;
};

// Función para determinar la plataforma basada en URL
const detectPlatformFromUrl = (url: string): string => {
  const lowerUrl = url.toLowerCase();
  
  for (const platform of socialPlatforms) {
    if (platform.urlPattern && lowerUrl.includes(platform.urlPattern)) {
      return platform.value;
    }
  }
  
  return "other";
};

export default function SocialLinks() {
  const { data: session, status, update } = useSession() as {
    data: Session | null;
    status: string;
    update: (data: Partial<Session["user"]>) => Promise<Session | null>;
  };
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SocialLink>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Obtener enlaces sociales desde la API
  const getSocialLinksData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/apiHandler/social/user/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener enlaces sociales');
      }
      
      const data = await response.json();
      setSocialLinks(data.socialLinks || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Cargar datos cuando cambia la sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      getSocialLinksData();
    }
  }, [status, session, getSocialLinksData]);
  
  // Resetear el estado de guardado exitoso
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Si se cambió la URL, intentar detectar la plataforma
    if (name === "url" && !formData.platform) {
      const detectedPlatform = detectPlatformFromUrl(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        platform: detectedPlatform
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error específico al editar el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Manejar cambios en el selector de plataforma
  const handlePlatformChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      platform: value
    }));
    
    // Limpiar error de plataforma
    if (errors.platform) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.platform;
        return newErrors;
      });
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.platform) {
      newErrors.platform = "La plataforma es requerida";
    }
    
    if (!formData.url) {
      newErrors.url = "La URL es requerida";
    } else {
      try {
        // Intentar crear una URL para validar
        new URL(formData.url);
        
        // Verificar que comienza con http o https
        if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
          newErrors.url = "La URL debe comenzar con http:// o https://";
        }
      } catch (e) {
        newErrors.url = "Por favor, introduce una URL válida";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Iniciar edición de un enlace social
  const startEditing = (link: SocialLink) => {
    setEditingId(link.id);
    setFormData({
      id: link.id,
      platform: link.platform,
      url: link.url,
      userId: link.userId
    });
  };
  
  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null);
    setFormData({});
    setErrors({});
  };
  
  // Añadir nuevo enlace social
  const addSocialLink = async () => {
    if (!validateForm() || !session?.user?.id) {
      return;
    }
    
    setRefreshing(true);
    setSaveSuccess(false);
    
    try {
      const linkData = {
        platform: formData.platform!,
        url: formData.url!,
        userId: session.user.id
      };
      
      const response = await fetch("/api/apiHandler/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear enlace social");
      }
      
      const data = await response.json();
      
      // Actualizar estado local
      const newLink = data.resultado.data;
      const updatedLinks = [...socialLinks, newLink];
      setSocialLinks(updatedLinks);
      
      setSaveSuccess(true);
      Message.successMessage("Enlace social añadido correctamente");
      
      // Limpiar formulario y cerrar diálogo
      setFormData({});
      setIsAddDialogOpen(false);
      
      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al añadir enlace social");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Actualizar enlace social existente
  const updateSocialLink = async (id: string) => {
    if (!validateForm()) {
      return;
    }
    
    setRefreshing(true);
    setSaveSuccess(false);
    
    try {
      const linkData = {
        platform: formData.platform!,
        url: formData.url!,
        userId: formData.userId!
      };
      
      const response = await fetch(`/api/apiHandler/social/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar enlace social");
      }
      
      const data = await response.json();
      
      // Actualizar estado local
      const updatedLink = data.resultado.data;
      const updatedLinks = socialLinks.map(link => 
        link.id === id ? updatedLink : link
      );
      setSocialLinks(updatedLinks);
      
      setSaveSuccess(true);
      Message.successMessage("Enlace social actualizado correctamente");
      
      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al actualizar enlace social");
    } finally {
      setRefreshing(false);
      setEditingId(null);
    }
  };
  
  // Eliminar enlace social
  const deleteSocialLink = async (id: string) => {
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
      
      // Actualizar estado local
      const updatedLinks = socialLinks.filter(link => link.id !== id);
      setSocialLinks(updatedLinks);
      
      
      Message.successMessage("Enlace social eliminado correctamente");
      
      // Recargar datos
      setTimeout(() => {
        getSocialLinksData();
      }, 300);
      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al eliminar enlace social");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Renderizar el formulario
  const SocialLinkForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform">Plataforma</Label>
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
        {errors.platform && <p className="text-destructive text-sm">{errors.platform}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <div className="flex items-center relative">
          <LinkIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="url" 
            name="url" 
           // value={formData.url || ""} 
            defaultValue={formData.url || ""}
            onChange={handleInputChange}
            placeholder="https://ejemplo.com/mi-perfil"
            className={cn(
              "pl-9",
              errors.url ? "border-destructive" : ""
            )}
          />
        </div>
        {errors.url && <p className="text-destructive text-sm">{errors.url}</p>}
      </div>
    </div>
  );
  
  // Estado de carga
  if (loading) {
    return (
      <Card className="bg-card border transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Enlaces Sociales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Ordenar enlaces sociales alfabéticamente por plataforma
  const sortedLinks = [...socialLinks].sort((a, b) => 
    a.platform.localeCompare(b.platform)
  );

  return (
    <Card className="bg-card border transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Enlaces Sociales</CardTitle>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                setFormData({});
                setErrors({});
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Añadir Enlace Social</DialogTitle>
            </DialogHeader>
            <SocialLinkForm />
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
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
                  <>Guardar</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {socialLinks.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <p className="text-muted-foreground">No has agregado enlaces sociales todavía.</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir primer enlace social
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sortedLinks.map((link) => {
                const isEditing = editingId === link.id;
                
                return (
                  <motion.div
                    key={link.id}
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
                        <SocialLinkForm />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(link.platform)}
                          <span className="font-medium">{link.platform}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <span className="max-w-[180px] sm:max-w-[250px] truncate">
                              {link.url}
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 ml-4">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={cancelEditing}
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
                                  onClick={() => updateSocialLink(link.id)}
                                  disabled={refreshing}
                                  className={`h-8 w-8 ${saveSuccess ? 'bg-green-100' : ''}`}
                                >
                                  {refreshing ? (
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
                                  onClick={() => startEditing(link)}
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
                                  onClick={() => deleteSocialLink(link.id)} 
                                  disabled={refreshing}
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
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}