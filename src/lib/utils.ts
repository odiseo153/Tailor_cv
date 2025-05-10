import { clsx, type ClassValue } from "clsx"
import { NextRequest } from "next/server"
import { twMerge } from "tailwind-merge"
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  const month = date.toLocaleString("default", { month: "short" })
  const year = date.getFullYear()

  return `${month} ${year}`
}

export function formatTimePetition(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds <= 0) return "Listo!";
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins > 0 ? `${mins}m ` : ""}${secs}s restantes`;
};

/**
 * Extrae la dirección IP del cliente de una solicitud para rate limiting
 * Intenta varias cabeceras comunes utilizadas en entornos de producción
 */
export function getRequestIp(req: any): string | null {
  if (!req) return null;

  // Si es un NextRequest (middleware o API route)
  if (req instanceof NextRequest) {
    // En Vercel, usa la implementación directa (antes de Next.js 15)
    // Para aplicaciones auto-alojadas, usa las cabeceras
    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const realIp = req.headers.get('x-real-ip');
    
    return forwarded || realIp || null;
  }

  // Para solicitudes estándar (Next.js API handler, etc.)
  const headers = req.headers;
  
  if (!headers) return null;

  const forwardedFor = headers['x-forwarded-for'] || 
                       headers.get?.('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = headers['x-real-ip'] || 
                headers.get?.('x-real-ip');
  
  return forwardedFor || realIp || 
         (req.socket?.remoteAddress) || 
         (req.connection?.remoteAddress) || null;
}

/**
 * Sanitiza texto de entrada para prevenir XSS
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Genera un token aleatorio para uso en verificación, recuperación, etc.
 */
export function generateRandomToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  // Crypto API es más segura que Math.random
  const randomValues = new Uint8Array(length);
  if (typeof window !== 'undefined') {
    // Cliente
    window.crypto.getRandomValues(randomValues);
  } else if (typeof crypto !== 'undefined') {
    // Servidor
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback (menos seguro)
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  
  return token;
}

/**
 * Valida la fortaleza de una contraseña
 */
export function isStrongPassword(password: string): { 
  isValid: boolean; 
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe incluir al menos una letra mayúscula");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe incluir al menos una letra minúscula");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("La contraseña debe incluir al menos un número");
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("La contraseña debe incluir al menos un carácter especial");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}