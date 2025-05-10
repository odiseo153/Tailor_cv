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
  GraduationCap,
  Calendar,
  CalendarIcon,
} from "lucide-react";
import { Message } from "@/app/utils/Message";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { es } from "date-fns/locale";


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

export default function EducationInfo() {
  const { data: session, status, update } = useSession() as {
    data: Session | null;
    status: string;
    update: (data: Partial<Session["user"]>) => Promise<Session | null>;
  };
  
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Education>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  const getEducationData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/apiHandler/education/user/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener información educativa');
      }
      
      const data = await response.json();
      setEducationList(data.education || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Cargar datos cuando cambia la sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      getEducationData();
    }
  }, [status, session, getEducationData]);
  
  // Resetear el estado de guardado exitoso
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico al editar el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  
  // Validar el formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.institution) {
      newErrors.institution = "La institución es requerida";
    }
    
    if (!formData.degree) {
      newErrors.degree = "El título o grado es requerido";
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate < startDate) {
        newErrors.endDate = "La fecha de finalización debe ser posterior a la fecha de inicio";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Iniciar edición de una educación
  const startEditing = (education: Education) => {
    setEditingId(education.id);
    setFormData({
      id: education.id,
      institution: education.institution,
      degree: education.degree,
      startDate: education.startDate,
      endDate: education.endDate,
      userId: education.userId
    });
  };
  
  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null);
    setFormData({});
    setErrors({});
  };
  
  // Añadir nueva educación
  const addEducation = async () => {
    if (!validateForm() || !session?.user?.id) {
      return;
    }
    
    setRefreshing(true);
    setSaveSuccess(false);
    
    try {
      const educationData = {
        institution: formData.institution!,
        degree: formData.degree!,
        startDate: formData.startDate!,
        endDate: formData.endDate,
        userId: session.user.id
      };
      
      const response = await fetch("/api/apiHandler/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(educationData),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear registro educativo");
      }
      
      const data = await response.json();
      
      // Actualizar estado local
      const newEducation = data.resultado.data;
      const updatedEducationList = [...educationList, newEducation];
      setEducationList(updatedEducationList);
      
      setSaveSuccess(true);
      Message.successMessage("Información educativa añadida correctamente");
      
      // Limpiar formulario y cerrar diálogo
      setFormData({});
      setIsAddDialogOpen(false);
   
      
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al añadir información educativa");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Actualizar educación existente
  const updateEducation = async (id: string) => {
    if (!validateForm()) {
      return;
    }
    
    setRefreshing(true);
    setSaveSuccess(false);
    
    try {
      const educationData = {
        institution: formData.institution!,
        degree: formData.degree!,
        startDate: formData.startDate!,
        endDate: formData.endDate,
        userId: formData.userId!
      };
      
      const response = await fetch(`/api/apiHandler/education/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(educationData),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar información educativa");
      }
      
      const data = await response.json();
      
      // Actualizar estado local
      const updatedEducation = data.resultado.data;
      const updatedEducationList = educationList.map(edu => 
        edu.id === id ? updatedEducation : edu
      );
      setEducationList(updatedEducationList);
      
      setSaveSuccess(true);
      Message.successMessage("Información educativa actualizada correctamente");
      
  
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al actualizar información educativa");
    } finally {
      setRefreshing(false);
      setEditingId(null);
    }
  };
  
  // Eliminar educación
  const deleteEducation = async (id: string) => {
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
      
      // Actualizar estado local
      const updatedEducationList = educationList.filter(edu => edu.id !== id);
      setEducationList(updatedEducationList);
      
      Message.successMessage("Información educativa eliminada correctamente");
      
     
    } catch (error) {
      console.error(error);
      Message.errorMessage("Error al eliminar información educativa");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Renderizar el formulario
  const EducationForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="institution">Institución/Universidad</Label>
        <div className="flex items-center relative">
          <GraduationCap className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="institution" 
            name="institution" 
            defaultValue={formData.institution || ""} 
            onChange={handleInputChange}
            placeholder="Universidad / Instituto"
            className={cn(
              "pl-9",
              errors.institution ? "border-destructive" : ""
            )}
          />
        </div>
        {errors.institution && <p className="text-destructive text-sm">{errors.institution}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="degree">Título/Grado</Label>
        <Input 
          id="degree" 
          name="degree" 
          defaultValue={formData.degree || ""} 
          onChange={handleInputChange}
          placeholder="Licenciatura, Maestría, Doctorado, etc."
          className={errors.degree ? "border-destructive" : ""}
        />
        {errors.degree && <p className="text-destructive text-sm">{errors.degree}</p>}
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
      
    
    </div>
  );
  
  // Estado de carga
  if (loading) {
    return (
      <Card className="bg-card border transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Educación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Ordenar educación por fecha de inicio (más reciente primero)
  const sortedEducation = [...educationList].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <Card className="bg-card border transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Educación</CardTitle>
        
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
          
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Añadir Educación</DialogTitle>
            </DialogHeader>
            <EducationForm />
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
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
                  <>Guardar</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {educationList.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <p className="text-muted-foreground">No has agregado información educativa todavía.</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir educación
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sortedEducation.map((education) => {
                const isEditing = editingId === education.id;
                
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
                        <EducationForm />
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => updateEducation(education.id)}
                            disabled={refreshing}
                            className={saveSuccess ? 'bg-green-600' : ''}
                          >
                            {refreshing ? (
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
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{education.institution}</h3>
                            <p className="text-md font-medium">{education.degree} </p>
                          </div>
                          <div className="flex items-start space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => startEditing(education)}
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
                                    onClick={() => deleteEducation(education.id)} 
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
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {format(new Date(education.startDate), "MMM yyyy", { locale: es })} - 
                            {education.endDate 
                              ? ` ${format(new Date(education.endDate), "MMM yyyy", { locale: es })}`
                              : "Actualmente estudiando"
                            }
                          </span>
                        </div>
                        
                        
                      </div>
                    )}
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
