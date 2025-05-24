"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Plus, Trash2, X, CheckIcon, Loader2, CalendarIcon, Briefcase, ChevronDown, ChevronUp } from "lucide-react"
import { useSession } from "next-auth/react"
import { Message } from "@/app/utils/Message"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface WorkExperience {
  id: string
  company: string
  jobTitle: string
  userId: string
  startDate: string // Usamos string para evitar problemas con Date en JSON
  endDate?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function WorkExperienceInfo() {
  const { data: session, status, update } = useSession()
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<WorkExperience>>({
    company: "",
    jobTitle: "",
    startDate: new Date().toISOString(), 
    endDate:new Date().toISOString(),
    description:""
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Inicializar experiencias desde la sesión cuando esté disponible
  const getWorkData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/apiHandler/work/user/${session.user.id}`);
      const data = await response.json();
      setExperiences(data.experiences || []);
    } catch (error) {
      console.error('Error fetching work experience:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      getWorkData();
    }
  }, [status, session])

  // Resetear indicador de éxito
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Alternar expansión de un ítem
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error específico al editar el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  // Validar el formulario antes del envío
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company?.trim()) {
      newErrors.company = "La empresa es requerida";
    }

    if (!formData.jobTitle?.trim()) {
      newErrors.jobTitle = "El puesto es requerido";
    }

    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        newErrors.endDate = "La fecha de fin no puede ser anterior a la fecha de inicio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const startEditing = (experience: WorkExperience) => {
    setEditingId(experience.id);
    setFormData({
      ...experience,
      // Formatear fechas para input type="date"
      startDate: formatDateForInput(experience.startDate),
      endDate: experience.endDate ? formatDateForInput(experience.endDate) : ''
    });
    
    // Expandir el ítem que se está editando
    if (!expandedItems.includes(experience.id)) {
      setExpandedItems(prev => [...prev, experience.id]);
    }
  }

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({});
    setErrors({});
  }

  // Formatear fecha para input type="date"
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Formatear fecha para mostrar
  const formatDateDisplay = (dateString: string | undefined) => {
    if (!dateString) return "Presente";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short'
    });
  }

  // Guardar nueva experiencia
  const addExperience = async () => {
    if (!validateForm() || !session?.user?.id) {
      return;
    }

    setRefreshing(true);
    setSaveSuccess(false);
    
    try {
      const userId = session.user.id;
      const experienceData = {
        ...formData,
        userId
      };

      const res = await fetch("/api/apiHandler/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: experienceData }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Agregar la nueva experiencia al estado local
      const newExperience = data.resultado.data;
      const updatedExperiences = [...experiences, newExperience];
      
      setExperiences(updatedExperiences);
      
      setSaveSuccess(true);
      Message.successMessage("Experiencia agregada correctamente");
      
      // Limpiar formulario y cerrar diálogo
      setFormData({});
      setIsAddDialogOpen(false);

      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al agregar experiencia");
    } finally {
      setRefreshing(false);
    }
  }

  // Actualizar experiencia existente
  const updateExperience = async (id: string) => {
    if (!validateForm()) {
      return;
    }

    setRefreshing(true);
    setSaveSuccess(false);
    
    try {
      const res = await fetch(`/api/apiHandler/work/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const data = await res.json();
      const updatedExperience = data.resultado.data;
      
      // Actualizar la experiencia en el estado local
      const updatedExperiences = experiences.map(exp => 
        exp.id === id ? updatedExperience : exp
      );
      
      setExperiences(updatedExperiences);
      
      setSaveSuccess(true);
      Message.successMessage("Experiencia actualizada correctamente");
      

      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al actualizar experiencia");
    } finally {
      setRefreshing(false);
      setEditingId(null);
    }
  }

  // Eliminar experiencia
  const handleDelete = async (id: string) => {
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

      // Actualizar el estado local
      const updatedExperiences = experiences.filter(exp => exp.id !== id);
      setExperiences(updatedExperiences);

      // Actualizar la sesión
      await update({ workExperience: updatedExperiences });

      Message.successMessage("Experiencia eliminada correctamente");
      
      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al eliminar la experiencia");
    } finally {
      setRefreshing(false);
    }
  }

  // Renderizar formulario
  const ExperienceForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <Input 
          id="company" 
          name="company" 
          defaultValue={formData.company || ""} 
          onChange={(e)=>setFormData({...formData,company:e.target.value})} 
          placeholder="Nombre de la empresa"
          className={errors.company ? "border-destructive" : ""}
        />
        {errors.company && <p className="text-destructive text-sm">{errors.company}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="jobTitle">Puesto</Label>
        <Input 
          id="jobTitle" 
          name="jobTitle" 
          defaultValue={formData.jobTitle || ""} 
          onChange={handleInputChange} 
          placeholder="Título del puesto"
          className={errors.jobTitle ? "border-destructive" : ""}
        />
        {errors.jobTitle && <p className="text-destructive text-sm">{errors.jobTitle}</p>}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de inicio</Label>
          <Input 
            id="startDate" 
            name="startDate" 
            type="date" 
            defaultValue={formData.startDate || ""} 
            onChange={handleInputChange} 
            className={errors.startDate ? "border-destructive" : ""}
          />
          {errors.startDate && <p className="text-destructive text-sm">{errors.startDate}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de fin</Label>
          <Input 
            id="endDate" 
            name="endDate" 
            type="date" 
            defaultValue={formData.endDate || ""} 
            onChange={handleInputChange} 
            className={errors.endDate ? "border-destructive" : ""}
            placeholder="Dejar vacío si es actual"
          />
          {errors.endDate && <p className="text-destructive text-sm">{errors.endDate}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea 
          id="description" 
          name="description" 
          defaultValue={formData.description || ""} 
          onChange={handleInputChange} 
          rows={4} 
          placeholder="Describe tus responsabilidades y logros"
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
      </div>
    </div>
  );

  // Estado de carga
  if (loading) {
    return (
      <Card className="bg-card border transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Experiencia Laboral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Experiencia Laboral</CardTitle>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                setEditingId(null);
                setFormData({});
                setErrors({});
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="text-xl">Agregar Experiencia Laboral</DialogTitle>
            <ExperienceForm />
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
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
                  <>Guardar</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {experiences.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <p className="text-muted-foreground">No has agregado experiencias laborales todavía.</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar primera experiencia
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {experiences.map((exp) => {
                const isEditing = editingId === exp.id;
                const isExpanded = expandedItems.includes(exp.id) || isEditing;
                
                return (
                  <motion.div
                    key={exp.id}
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
                      {/* Sección superior - siempre visible */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{exp.jobTitle}</h3>
                            {!isEditing && !exp.endDate && (
                              <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                                Actual
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {formatDateDisplay(exp.startDate)} - {formatDateDisplay(exp.endDate)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
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
                                      onClick={() => updateExperience(exp.id)}
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
                                      onClick={() => startEditing(exp)}
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
                                      onClick={() => handleDelete(exp.id)} 
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
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => toggleExpand(exp.id)}
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
                      
                      {/* Sección de edición o contenido expandido */}
                      <AnimatePresence>
                        {isEditing ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t"
                          >
                            <ExperienceForm />
                          </motion.div>
                        ) : isExpanded && exp.description ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t"
                          >
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {exp.description}
                            </p>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
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