import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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