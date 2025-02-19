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
import { useAppContext } from "@/app/layout/AppContext"


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false);
  const {setUser} = useAppContext();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const formData = new FormData();

    formData.append('email',data.email);
    formData.append('password',data.password);

    
    try {
        const response = await fetch('/api/login',{
            method:"POST",
            body:formData
        });

        const authData = await response.json();

        console.log(authData);
        if(authData.resultado.success){
            Message.successMessage(`Bienvenido ${authData.resultado.user.name}`);
            setUser(authData.resultado.user);
        }else{
            Message.errorMessage("Credenciales invalidas");
        }
    } catch (error) {
        Message.errorMessage("Error de inicio de sesion");
        console.error("Login error:", error);
    } finally {
        setIsLoading(false);
    }

  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    console.log("Register data:", data)

    const formData = new FormData();

    formData.append('email',data.email);
    formData.append('password',data.password);
    formData.append('name',data.name);

    try {
        // Simulating registration API call
        const response = await fetch('/api/register',{
            method:"POST",
            body:formData
        });

        const authData = await response.json();
        
        Message.successMessage("Registro exitoso!");
        setIsLogin(true);
        console.log(authData);
    } catch (error) {
        Message.errorMessage("Error al registrar usuario");
        console.error("Registration error:", error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg ">
      <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? "Login" : "Register"}</h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...loginForm.register("email")}
                  defaultValue="test@gmail.com"
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
                  defaultValue="password"
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
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  {...registerForm.register("name")}
                  className={registerForm.formState.errors.name ? "border-red-500" : ""}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerForm.register("email")}
                  className={registerForm.formState.errors.email ? "border-red-500" : ""}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...registerForm.register("password")}
                  className={registerForm.formState.errors.password ? "border-red-500" : ""}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerForm.register("confirmPassword")}
                  className={registerForm.formState.errors.confirmPassword ? "border-red-500" : ""}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-blue-600 hover:underline focus:outline-none"
        >
          {isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  )
}

