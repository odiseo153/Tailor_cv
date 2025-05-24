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
import { Slider } from "@/components/ui/slider";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  CheckIcon, 
  Loader2, 
  LightbulbIcon,
  StarIcon
} from "lucide-react";
import { Message } from "@/app/utils/Message";
import { Skill } from "@prisma/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useI18n } from "@/app/context/I18nContext";

export default function Skills() {
  const { t } = useI18n();
  const { data: session, status, update } = useSession() as {
    data: Session | null;
    status: string;
    update: (data: Partial<Session["user"]>) => Promise<Session | null>;
  };
  
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Skill>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Obtener habilidades desde la API
  const getSkillsData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/apiHandler/skill/user/${session.user.id}`);
      
      const data = await response.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Cargar datos cuando cambia la sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      getSkillsData();
    }
  }, [status, session, getSkillsData]);
  
  // Resetear el estado de guardado exitoso
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | number[]
  ) => {
    if (Array.isArray(e)) {
      // Es un cambio del slider
      setFormData(prev => ({ ...prev, level: e[0] }));
      
      // Limpiar error si existía
      if (errors.level) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.level;
          return newErrors;
        });
      }
    } else {
      // Es un cambio de input normal
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Limpiar error si existía
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = t('profile.skills.name_required');
    }
    
    if (!formData.level) {
      newErrors.level = t('profile.skills.level_required');
    } else if (formData.level < 1 || formData.level > 5) {
      newErrors.level = t('profile.skills.level_range');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Iniciar edición de una habilidad
  const startEditing = (skill: Skill) => {
    setEditingId(skill.id);
    setFormData({
      id: skill.id,
      name: skill.name,
      level: skill.level,
      userId: skill.userId
    });
  };
  
  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null);
    setFormData({});
    setErrors({});
  };
  
  // Añadir nueva habilidad
  const addSkill = async () => {
    if (!validateForm() || !session?.user?.id) {
      return;
    }
    
    setRefreshing(true);
    setSaveSuccess(false);
    
    try {
      const skillData = {
        name: formData.name!,
        level: formData.level!,
        userId: session.user.id
      };
      
      const response = await fetch("/api/apiHandler/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });
      
      if (!response.ok) {
        throw new Error(t('profile.skills.error_creating'));
      }
      
      const data = await response.json();
      
      // Actualizar estado local
      const newSkill = data.resultado.data;
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      
      setSaveSuccess(true);
      Message.successMessage(t('profile.skills.added_success'));
      
      // Limpiar formulario y cerrar diálogo
      setFormData({});
      setIsAddDialogOpen(false);
 
      
    } catch (error) {
      console.error(error);
      Message.errorMessage(t('profile.skills.add_error'));
    } finally {
      setRefreshing(false);
    }
  };
  
  // Actualizar habilidad existente
  const updateSkill = async (id: string) => {
    if (!validateForm()) {
      return;
    }
    
    setRefreshing(true);
    setSaveSuccess(false);
    
    try {
      const skillData = {
        name: formData.name!,
        level: formData.level!,
        userId: formData.userId!
      };
      
      const response = await fetch(`/api/apiHandler/skill/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });
      
      if (!response.ok) {
        throw new Error(t('profile.skills.error_updating'));
      }
      
      const data = await response.json();
      
      // Actualizar estado local
      const updatedSkill = data.resultado.data;
      const updatedSkills = skills.map(skill => 
        skill.id === id ? updatedSkill : skill
      );
      setSkills(updatedSkills);
      
      
      setSaveSuccess(true);
      Message.successMessage(t('profile.skills.updated_success'));
      
      
    } catch (error) {
      console.error(error);
      Message.errorMessage(t('profile.skills.update_error'));
    } finally {
      setRefreshing(false);
      setEditingId(null);
    }
  };
  
  // Eliminar habilidad
  const deleteSkill = async (id: string) => {
    if (!confirm(t('profile.skills.confirm_delete'))) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const response = await fetch(`/api/apiHandler/skill/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error(t('profile.skills.error_deleting'));
      }
      
      // Actualizar estado local
      const updatedSkills = skills.filter(skill => skill.id !== id);
      setSkills(updatedSkills);
      
      
      Message.successMessage(t('profile.skills.deleted_success'));
      
      // Recargar datos
      setTimeout(() => {
        getSkillsData();
      }, 300);
      
    } catch (error) {
      console.error(error);
      Message.errorMessage(t('profile.skills.delete_error'));
    } finally {
      setRefreshing(false);
    }
  };
  
  // Renderizar estrellas según el nivel
  const renderStars = (level: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StarIcon 
        key={index} 
        size={16} 
        className={cn(
          "transition-colors",
          index < level 
            ? "fill-primary text-primary" 
            : "fill-none text-muted-foreground/40"
        )} 
      />
    ));
  };
  
  // Renderizar el formulario
  const SkillForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('profile.skills.skill_name')}</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={formData.name} 
          onChange={handleInputChange}
          placeholder={t('profile.skills.skill_placeholder')}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="level">{t('profile.skills.level')} ({formData.level || 1}/5)</Label>
          <div className="flex items-center">
            {renderStars(formData.level || 1)}
          </div>
        </div>
        <Slider 
          id="level"
          defaultValue={[formData.level || 1]} 
          max={5} 
          min={1} 
          step={1} 
          onValueChange={handleInputChange}
          className={errors.level ? "border-destructive" : ""}
        />
        {errors.level && <p className="text-destructive text-sm">{errors.level}</p>}
      </div>
    </div>
  );
  
  // Estado de carga
  if (loading) {
    return (
      <Card className="bg-card border transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">{t('profile.skills.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Filtrar habilidades según la búsqueda
  const filteredSkills = searchQuery.trim() === ""
    ? skills
    : skills.filter(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
  // Ordenar habilidades por nivel y nombre
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    if (a.level !== b.level) {
      return b.level - a.level; // Ordenar por nivel descendente
    }
    return a.name.localeCompare(b.name); // Si tienen el mismo nivel, ordenar por nombre
  });

  return (
    <Card className="bg-card border transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{t('profile.skills.title')}</CardTitle>
        
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder={t('profile.skills.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[140px] sm:w-[200px] h-9 pl-8"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setFormData({ level: 1 });
                  setErrors({});
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('profile.skills.add')}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">{t('profile.skills.add_skill')}</DialogTitle>
              </DialogHeader>
              <SkillForm />
              <DialogFooter className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  {t('profile.personal_info.cancel')}
                </Button>
                <Button 
                  onClick={addSkill} 
                  disabled={refreshing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('profile.personal_info.saving')}
                    </>
                  ) : (
                    <>{t('profile.personal_info.save')}</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {skills.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <LightbulbIcon className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <p className="text-muted-foreground">{t('profile.skills.no_skills')}</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('profile.skills.add_first')}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sortedSkills.map((skill) => {
                const isEditing = editingId === skill.id;
                
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
                        <SkillForm />
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
                                  onClick={() => updateSkill(skill.id)}
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
                                <p>{t('profile.personal_info.save')}</p>
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
                                  onClick={() => startEditing(skill)}
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
                                  onClick={() => deleteSkill(skill.id)} 
                                  disabled={refreshing}
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
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {searchQuery && filteredSkills.length === 0 && (
              <p className="text-center py-6 text-muted-foreground">
                {t('profile.skills.no_results').replace('{query}', searchQuery)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}