import Swal, { SweetAlertResult } from "sweetalert2";
import { AICreditsError, providerLabel } from "@/lib/ai-credits";

const TIMER_DURATION = 2000;
const TOAST_BASE_CONFIG = {
  toast: true,
  position: "top-end" as const,
  showConfirmButton: false,
  timer: TIMER_DURATION,
  timerProgressBar: true,
  didOpen: (toast: HTMLElement) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
};

export class Message {
  private static getBaseToast() {
    return Swal.mixin(TOAST_BASE_CONFIG);
  }

  static errorMessage(message: string): void {
    Message.getBaseToast().fire({
      icon: "error",
      title: `¡Oops! ${message}`
    });
  }

  /** AI failure: a blocking popup when the provider has no credits, a toast otherwise. */
  static aiError(error: unknown, t: (key: string) => string, fallbackMessage: string): void {
    if (error instanceof AICreditsError) {
      Swal.fire({
        icon: "warning",
        title: t("ai_errors.no_credits_title"),
        text: t("ai_errors.no_credits").replace(/\{provider\}/g, providerLabel(error.provider)),
        confirmButtonColor: "#316FED",
      });
      return;
    }
    Message.errorMessage(fallbackMessage);
  }

  static informationMessage(message: string): void {
    Message.getBaseToast().fire({
      icon: "info",
      title: message
    });
  }

  static successMessage(message: string): void {
    Message.getBaseToast().fire({
      icon: "success",
      title: message
    });
  }

  static async warningConfirmation(message: string): Promise<boolean> {
    const result = await Swal.fire({
      title: "¡Espera!",
      text: message,
      icon: "warning",
      confirmButtonColor: "#316FED",
      confirmButtonText: "¡Sí!",
      showCancelButton: true,
      cancelButtonText: "No",
      allowOutsideClick: false,
      allowEscapeKey: false
    });
    
    return result.isConfirmed;
  }
}