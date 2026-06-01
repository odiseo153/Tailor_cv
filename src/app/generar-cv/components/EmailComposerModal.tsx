"use client";

import { Loader2, Mail, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled: boolean;
  isSendingEmail: boolean;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  isGeneratingEmailSubject: boolean;
  isGeneratingEmailBody: boolean;
  onEmailToChange: (value: string) => void;
  onEmailSubjectChange: (value: string) => void;
  onEmailBodyChange: (value: string) => void;
  onGenerateSubject: () => void;
  onGenerateBody: () => void;
  onSend: () => void;
};

export function EmailComposerModal(props: Props) {
  const {
    open,
    onOpenChange,
    disabled,
    isSendingEmail,
    emailTo,
    emailSubject,
    emailBody,
    isGeneratingEmailSubject,
    isGeneratingEmailBody,
    onEmailToChange,
    onEmailSubjectChange,
    onEmailBodyChange,
    onGenerateSubject,
    onGenerateBody,
    onSend,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="outline" size="sm" className="gap-2">
          <Mail size={16} /> Enviar por correo
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden border-0 p-0 sm:max-w-4xl">
        <div className="rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b bg-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Nuevo mensaje
            </h3>
          </div>
          <div className="space-y-0">
            <div className="border-b px-4 py-3">
              <Input
                type="email"
                placeholder="Para"
                value={emailTo}
                onChange={(e) => onEmailToChange(e.target.value)}
                className="border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <Input
                placeholder="Asunto"
                value={emailSubject}
                onChange={(e) => onEmailSubjectChange(e.target.value)}
                className="border-0 px-0 shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={onGenerateSubject}
                disabled={isGeneratingEmailSubject}
              >
                {isGeneratingEmailSubject ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
              </Button>
            </div>
            <div className="px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  CV adjunto: cv_generated.pdf
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={onGenerateBody}
                  disabled={isGeneratingEmailBody}
                >
                  {isGeneratingEmailBody ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-1" />
                      Generar cuerpo
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={emailBody}
                onChange={(e) => onEmailBodyChange(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="min-h-[22rem] resize-none border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
            <span className="text-xs text-gray-500">
              El CV se enviara convertido a PDF.
            </span>
            <Button
              type="button"
              onClick={onSend}
              disabled={isSendingEmail}
              className="gap-2 rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
