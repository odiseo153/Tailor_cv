"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Message } from "@/app/utils/Message";
import { isStrongPassword } from "@/lib/utils";

interface RegisterComponentProps {
  isModal?: boolean;
  onSuccess?: () => void;
}

export default function RegisterComponent({ isModal = false, onSuccess }: RegisterComponentProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: false, errors: [] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar contraseña mientras se escribe
    if (name === "password") {
      setPasswordValidation(isStrongPassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reiniciar mensajes
    setErrorMessage("");
    setSuccessMessage("");
    
    // Validación básica
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Por favor, completa todos los campos.");
      return;
    }
    
    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }
    
    // Validar fortaleza de contraseña
    const passwordCheck = isStrongPassword(formData.password);
    if (!passwordCheck.isValid) {
      setErrorMessage(passwordCheck.errors.join(" "));
      return;
    }

    try {
      setIsLoading(true);
      
      // Registrar el usuario mediante nuestra API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      // Si el registro fue exitoso
      if (response.ok && data.success) {
        setSuccessMessage("¡Registro exitoso! Iniciando sesión...");
        Message.successMessage("Registro exitoso");
        
        // Iniciar sesión automáticamente
        setTimeout(async () => {
          const result = await signIn("credentials", {
            redirect: !isModal,
            email: formData.email,
            password: formData.password,
            callbackUrl: "/profile",
          });
          
          if (result?.ok) {
            if (onSuccess) {
              onSuccess();
            }
            
            if (!isModal) {
              router.push("/profile");
              router.refresh();
            }
          }
        }, 1000);
      } else {
        setErrorMessage(data.error || "Error al registrar usuario");
      }
    } catch (error: any) {
      console.error("Error en registro:", error);
      setErrorMessage(
        error.response?.data?.error || 
        "Ha ocurrido un error al registrar tu cuenta. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await signIn(provider, { 
        callbackUrl: isModal ? undefined : "/profile",
        redirect: !isModal
      });
      
      if (isModal && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(`Error al iniciar sesión con ${provider}:`, error);
    }
  };

  return (
    <div className={isModal ? "" : "max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="bg-green-50 text-green-700 border-green-200 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            className="w-full"
            autoFocus
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="w-full pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 bg-transparent"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
          
          {/* Indicadores de fortaleza de contraseña */}
          {formData.password && (
            <div className="text-xs space-y-1 mt-1">
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      passwordValidation.errors.length <= i
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              
              <ul className="space-y-1 text-gray-500">
                <li className={`flex items-center gap-1 ${
                  formData.password.length >= 8 ? "text-green-600" : ""
                }`}>
                  <span className="w-3 h-3">{formData.password.length >= 8 ? "✓" : "·"}</span>
                  <span>Mínimo 8 caracteres</span>
                </li>
                <li className={`flex items-center gap-1 ${
                  /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                }`}>
                  <span className="w-3 h-3">{/[A-Z]/.test(formData.password) ? "✓" : "·"}</span>
                  <span>Una letra mayúscula</span>
                </li>
                <li className={`flex items-center gap-1 ${
                  /[0-9]/.test(formData.password) ? "text-green-600" : ""
                }`}>
                  <span className="w-3 h-3">{/[0-9]/.test(formData.password) ? "✓" : "·"}</span>
                  <span>Un número</span>
                </li>
                <li className={`flex items-center gap-1 ${
                  /[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : ""
                }`}>
                  <span className="w-3 h-3">{/[^A-Za-z0-9]/.test(formData.password) ? "✓" : "·"}</span>
                  <span>Un carácter especial</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="w-full pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 bg-transparent"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
          
          {formData.password && formData.confirmPassword && (
            <div className="text-xs mt-1">
              <span className={`flex items-center gap-1 ${
                formData.password === formData.confirmPassword
                  ? "text-green-600"
                  : "text-red-500"
              }`}>
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>Las contraseñas coinciden</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>Las contraseñas no coinciden</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Registrando..." : "Crear Cuenta"}
        </Button>
      </form>
      
      <div className="relative flex py-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">O regístrate con</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("linkedin")}
          disabled={isLoading}
        >
          LinkedIn
        </Button>
      </div>
      
      {!isModal && (
        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Iniciar sesión
            </Link>
          </span>
        </div>
      )}
    </div>
  );
} 