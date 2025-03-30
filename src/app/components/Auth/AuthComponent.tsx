"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Message } from "@/app/utils/Message";
import { useStore } from "@/app/context/AppContext";
import { Separator } from "@/components/ui/separator";
import { LucideLinkedin } from "lucide-react";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: "El nombre es obligatorio" }),
  phone: z.string().optional(),
  location: z.string().optional(),
  profilePicture: z.string().optional(),
});

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { authOpen, setAuthOpen } = useStore();

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const response = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        response?.ok
          ? Message.successMessage("Bienvenido")
          : Message.errorMessage("Error al iniciar sesión");
      } else {
        const response = await fetch("/api/apiHandler/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        response.ok
          ? Message.successMessage("Registro exitoso")
          : Message.errorMessage("Error al registrarse");

          const res = await response.json();

          console.log(res);
      }
      setAuthOpen(false);
    } catch (error) {
      Message.errorMessage("Ocurrió un error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? "Iniciar Sesión" : "Registrarse"}
      </h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    className={form.formState.errors.name ? "border-red-500" : ""}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                className={form.formState.errors.email ? "border-red-500" : ""}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                className={form.formState.errors.password ? "border-red-500" : ""}
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
            </Button>
            <Separator className="my-4" />
          </form>
          <div className="mt-4 space-y-2 text-center">
            <Button
              onClick={() => signIn("linkedin")}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <LucideLinkedin /> Iniciar sesión con LinkedIn
            </Button>
            <Button
              onClick={() => signIn("google")}
              className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
            >
              Iniciar sesión con Google
            </Button>
          </div>
          <p
            className="text-sm text-center mt-4 cursor-pointer text-blue-600 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}