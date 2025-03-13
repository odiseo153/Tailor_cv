"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Message } from "@/app/utils/Message"
import { useAppContext } from "@/app/context/AppContext"
import { Separator } from "@/components/ui/separator"
import { LucideLinkedin } from "lucide-react"


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAppContext();
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });

      const authData = await response.json();
      if (authData.resultado.success) {
        Message.successMessage(`Bienvenido ${authData.resultado.user.name}`);
        setUser(authData.resultado.user);
      } else {
        Message.errorMessage("Credenciales inválidas");
      }
    } catch (error) {
      Message.errorMessage("Error de inicio de sesión");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_API_LINKEDIN_CLIENT_ID; 
    const redirectUri = "http://localhost:3001/api/auth/linkedin/callback";
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=r_liteprofile`;

    window.location.href = linkedInAuthUrl;
  };


  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg ">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...loginForm.register("email")}
                className={loginForm.formState.errors.email ? "border-red-500" : ""}
              />
              {loginForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...loginForm.register("password")}
                className={loginForm.formState.errors.password ? "border-red-500" : ""}
              />
              {loginForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Separator className="my-4" />
          </form>
          <div className="mt-4 space-y-2 text-center">
            <Button onClick={handleLinkedInLogin} className="w-full bg-blue-600 text-white hover:bg-blue-700">
              <LucideLinkedin/> Iniciar sesión con LinkedIn
            </Button>
            <Button onClick={handleLinkedInLogin} className="w-full bg-yellow-600 text-white hover:bg-yellow-700">
               Iniciar sesión con Google
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
