"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Message } from "@/app/utils/Message";
import { useI18n } from "@/app/context/I18nContext";

interface LoginComponentProps {
  isModal?: boolean;
  onSuccess?: () => void;
}

export default function LoginComponent({ isModal = false, onSuccess }: LoginComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const error = searchParams.get("error");
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Translate NextAuth errors
  const getErrorMessage = (error: string) => {
    switch (error) {
      case "CredentialsSignin":
        return t("auth.errors.credentials");
      case "AccessDenied":
        return t("auth.errors.access_denied");
      case "EmailSignin":
        return t("auth.errors.email_signin");
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
        return t("auth.errors.oauth_error");
      case "SessionRequired":
        return t("auth.errors.session_required");
      default:
        return t("auth.errors.default");
    }
  };

  // Update error message if there's an error in the URL
  useEffect(() => {
    if (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password) {
      setErrorMessage(t("auth.errors.required_fields"));
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setErrorMessage(getErrorMessage(result.error));
        return;
      }

      if (result?.ok) {
        Message.successMessage(t("auth.login.successful_login"));
        
        if (onSuccess) {
          onSuccess();
        }
        
        if (!isModal) {
          router.push(callbackUrl || "/profile");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      setErrorMessage(t("auth.errors.unexpected_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await signIn(provider, { 
        callbackUrl: isModal ? undefined : callbackUrl,
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
        
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.login.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.login.email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full"
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">{t("auth.login.password")}</Label>
            {!isModal && (
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {t("auth.login.forgot_password")}
              </Link>
            )}
          </div>
          
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full pr-10"
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
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm cursor-pointer">
            {t("auth.login.remember_me")}
          </Label>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t("auth.login.logging_in") : t("auth.login.login_button")}
        </Button>
      </form>
      
      <div className="relative flex py-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t("auth.login.or_continue_with")}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("google")}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin("linkedin")}
        >
          LinkedIn
        </Button>
      </div>
      
      {!isModal && (
        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">
            {t("auth.login.no_account")}{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              {t("auth.login.register_link")}
            </Link>
          </span>
        </div>
      )}
    </div>
  );
} 