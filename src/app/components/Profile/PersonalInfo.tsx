"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckIcon, PencilIcon, X, Loader2 } from "lucide-react"
import { validateEmail, validatePhone } from "@/app/utils/validation"
import { useSession } from "next-auth/react"
import { Message } from "@/app/utils/Message"
import { Session } from "@/app/api/auth/[...nextauth]/route"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/app/context/I18nContext"

export default function PersonalInfo() {
  const { t } = useI18n();
  const { data: session, update, status } = useSession() as {
    data: Session | null;
    update: (data: Partial<Session["user"]>) => Promise<Session | null>;
    status: "loading" | "authenticated" | "unauthenticated";
  };
  
  const user = session?.user;
  
  const [editedUser, setEditedUser] = useState<Session['user'] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Actualizar estado local cuando cambia la sesión
  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user, status]);
  
  // Efecto para resetear el indicador de éxito
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
    
    // Limpiar error específico al editar el campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  const validateForm = () => {
    if (!editedUser) return false;
    
    const newErrors: Record<string, string> = {};

    if (!editedUser.name) {
      newErrors.name = t('profile.personal_info.fields.name.error');
    }

    if (!editedUser.email) {
      newErrors.email = t('profile.personal_info.fields.email.error');
    } else if (!validateEmail(editedUser.email as string)) {
      newErrors.email = t('profile.personal_info.fields.email.invalid');
    }

    if (editedUser.phone && !validatePhone(editedUser.phone)) {
      newErrors.phone = t('profile.personal_info.fields.phone.error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editedUser) {
      return;
    }

    setIsLoading(true);
    setSaveSuccess(false);
    
    try {
      const request = await fetch('/api/apiHandler/user', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editedUser.id,
          name: editedUser.name,
          email: editedUser.email,
          phone: editedUser.phone,
          location: editedUser.location,
          profilePicture: editedUser.profilePicture || editedUser.image
        })
      });

      const response = await request.json();
      
      if (!response.success && !response.resultado) {
        throw new Error(response.message || t('profile.personal_info.error'));
      }
      
      const newData = response.resultado?.data || response.data;

      // Actualizar estado local
      setEditedUser({
        ...editedUser,
        name: newData.name,
        email: newData.email,
        phone: newData.phone,
        location: newData.location,
        profilePicture: newData.profilePicture
      });
      
      setIsEditing(false);
      setErrors({});
      setSaveSuccess(true);
      Message.successMessage(t('profile.personal_info.success'));
      
      
    } catch (error) {
      console.error(error);
      Message.errorMessage(t('profile.personal_info.error'));
    } finally {
      setIsLoading(false);
    }
  }

  const cancelEdit = () => {
    // Restablecer el estado editado al estado actual del usuario
    setEditedUser(user as Session['user']);
    setErrors({});
    setIsEditing(false);
  }
  
  // Si está cargando o no hay datos, mostrar un estado de carga
  if (status === "loading" || !editedUser) {
    return (
      <Card className="transition-all duration-300 bg-card border hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">{t('profile.personal_info.title')}</CardTitle>
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
    <Card className="transition-all duration-300 bg-card border hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">{t('profile.personal_info.title')}</CardTitle>
        <TooltipProvider>
          {!isEditing ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="ghost" 
                  size="icon"
                  aria-label={t('profile.personal_info.edit')}
                  className="hover:bg-primary/10"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('profile.personal_info.edit')}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={cancelEdit} 
                    variant="outline" 
                    size="icon"
                    aria-label={t('profile.personal_info.cancel')}
                    className="hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('profile.personal_info.cancel')}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleSubmit} 
                    variant="outline" 
                    size="icon"
                    disabled={isLoading}
                    aria-label={t('profile.personal_info.save')}
                    className={`hover:bg-green-100 ${saveSuccess ? 'bg-green-100' : ''}`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saveSuccess ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('profile.personal_info.save')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit(e); }}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 border-2 border-primary/20 transition-all duration-300">
                <AvatarImage 
                  src={editedUser?.profilePicture || editedUser?.image || ""} 
                  alt={editedUser?.name as string} 
                />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {editedUser?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className={`space-y-2 transition-all duration-300 ${isEditing ? 'bg-muted/50 p-3 rounded-lg' : ''}`}>
                <Label 
                  htmlFor="name" 
                  className={`text-sm font-medium transition-opacity duration-300 ${isEditing ? 'opacity-100 text-primary' : 'opacity-70'}`}
                >
                  {t('profile.personal_info.fields.name.label')}
                </Label>
                {isEditing ? (
                  <div>
                    <Input 
                      id="name" 
                      name="name" 
                      value={editedUser?.name as string || ""} 
                      onChange={handleInputChange} 
                      className={`transition-all duration-200 ${errors.name ? "border-destructive ring-destructive" : ""}`}
                      placeholder={t('profile.personal_info.fields.name.placeholder')}
                      autoFocus
                    />
                    {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                  </div>
                ) : (
                  <p className="text-xl font-medium">{editedUser?.name}</p>
                )}
              </div>
              
              <div className={`space-y-2 transition-all duration-300 ${isEditing ? 'bg-muted/50 p-3 rounded-lg' : ''}`}>
                <Label 
                  htmlFor="email" 
                  className={`text-sm font-medium transition-opacity duration-300 ${isEditing ? 'opacity-100 text-primary' : 'opacity-70'}`}
                >
                  {t('profile.personal_info.fields.email.label')}
                </Label>
                {isEditing ? (
                  <div>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={editedUser?.email as string || ""} 
                      onChange={handleInputChange} 
                      className={`transition-all duration-200 ${errors.email ? "border-destructive ring-destructive" : ""}`}
                      placeholder={t('profile.personal_info.fields.email.placeholder')}
                    />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                  </div>
                ) : (
                  <p className="text-gray-600">{editedUser?.email}</p>
                )}
              </div>
              
              <div className={`space-y-2 transition-all duration-300 ${isEditing ? 'bg-muted/50 p-3 rounded-lg' : ''}`}>
                <Label 
                  htmlFor="phone" 
                  className={`text-sm font-medium transition-opacity duration-300 ${isEditing ? 'opacity-100 text-primary' : 'opacity-70'}`}
                >
                  {t('profile.personal_info.fields.phone.label')}
                </Label>
                {isEditing ? (
                  <div>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      value={editedUser?.phone as string || ""} 
                      onChange={handleInputChange} 
                      className={`transition-all duration-200 ${errors.phone ? "border-destructive ring-destructive" : ""}`}
                      placeholder={t('profile.personal_info.fields.phone.placeholder')}
                    />
                    {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                  </div>
                ) : (
                  <p className="text-gray-600">{editedUser?.phone || t('profile.personal_info.fields.phone.not_specified')}</p>
                )}
              </div>
              
              <div className={`space-y-2 transition-all duration-300 ${isEditing ? 'bg-muted/50 p-3 rounded-lg' : ''}`}>
                <Label 
                  htmlFor="location" 
                  className={`text-sm font-medium transition-opacity duration-300 ${isEditing ? 'opacity-100 text-primary' : 'opacity-70'}`}
                >
                  {t('profile.personal_info.fields.location.label')}
                </Label>
                {isEditing ? (
                  <div>
                    <Input 
                      id="location" 
                      name="location" 
                      value={editedUser?.location as string || ""} 
                      onChange={handleInputChange}
                      placeholder={t('profile.personal_info.fields.location.placeholder')}
                    />
                  </div>
                ) : (
                  <p className="text-gray-600">{editedUser?.location || t('profile.personal_info.fields.location.not_specified')}</p>
                )}
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex justify-end mt-6 space-x-2 md:hidden">
              <Button 
                type="button" 
                onClick={cancelEdit} 
                variant="outline" 
                size="sm"
                className="w-full md:w-auto"
              >
                {t('profile.personal_info.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('profile.personal_info.saving')}
                  </>
                ) : (
                  <>{t('profile.personal_info.save')}</>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

