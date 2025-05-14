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
import { useI18n } from "@/app/context/I18nContext";

interface RegisterComponentProps {
  isModal?: boolean;
  onSuccess?: () => void;
}

export default function RegisterComponent({ isModal = false, onSuccess }: RegisterComponentProps) {
  const router = useRouter();
  const { t } = useI18n();
  
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
    
    // Validate password as typing
    if (name === "password") {
      setPasswordValidation(isStrongPassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage(t("auth.errors.required_fields"));
      return;
    }
    
    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(t("auth.errors.passwords_not_match"));
      return;
    }
    
    // Validate password strength
    const passwordCheck = isStrongPassword(formData.password);
    if (!passwordCheck.isValid) {
      setErrorMessage(passwordCheck.errors.join(" "));
      return;
    }

    try {
      setIsLoading(true);
      
      // Register user through our API
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
      
      // If registration was successful
      if (response.ok && data.success) {
        setSuccessMessage(t("auth.register.successful_register"));
        Message.successMessage(t("auth.register.successful_register"));
        
        // Log in automatically
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
        setErrorMessage(data.error || t("auth.errors.registration_error"));
      }
    } catch (error: any) {
      console.error("Error en registro:", error);
      setErrorMessage(
        error.response?.data?.error || 
        t("auth.errors.unexpected_error")
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
          <Label htmlFor="name">{t("auth.register.name")}</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={t("auth.register.name_placeholder")}
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
          <Label htmlFor="email">{t("auth.register.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("auth.register.email_placeholder")}
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.register.password")}</Label>
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
          
          {/* Password strength indicators */}
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
                  <span>{t("auth.register.password_strength.min_length")}</span>
                </li>
                <li className={`flex items-center gap-1 ${
                  /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                }`}>
                  <span className="w-3 h-3">{/[A-Z]/.test(formData.password) ? "✓" : "·"}</span>
                  <span>{t("auth.register.password_strength.uppercase")}</span>
                </li>
                <li className={`flex items-center gap-1 ${
                  /[0-9]/.test(formData.password) ? "text-green-600" : ""
                }`}>
                  <span className="w-3 h-3">{/[0-9]/.test(formData.password) ? "✓" : "·"}</span>
                  <span>{t("auth.register.password_strength.number")}</span>
                </li>
                <li className={`flex items-center gap-1 ${
                  /[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : ""
                }`}>
                  <span className="w-3 h-3">{/[^A-Za-z0-9]/.test(formData.password) ? "✓" : "·"}</span>
                  <span>{t("auth.register.password_strength.special")}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("auth.register.confirm_password")}</Label>
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
                    <span>{t("auth.register.password_strength.passwords_match")}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>{t("auth.register.password_strength.passwords_not_match")}</span>
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
          {isLoading ? t("auth.register.registering") : t("auth.register.create_button")}
        </Button>
      </form>
      
      <div className="relative flex py-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t("auth.register.or_register_with")}</span>
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
            {t("auth.register.have_account")}{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              {t("auth.register.login_link")}
            </Link>
          </span>
        </div>
      )}
    </div>
  );
} 