"use client"

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckIcon, ChevronLeft, ChevronRight, ImagePlus, Loader2, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/app/context/I18nContext";
import { Message } from "@/app/utils/Message";
import { cn } from "@/lib/utils";

export type FormErrors<F> = Partial<Record<keyof F | "general", string>>;

// Fired after any profile record changes, so summary counters can refresh.
export const PROFILE_CHANGED_EVENT = "profile-data-changed";

export interface ActionLabels {
  edit: string;
  delete: string;
  cancel: string;
  save: string;
  saving: string;
}

export const DEFAULT_LABELS: ActionLabels = {
  edit: "Editar",
  delete: "Eliminar",
  cancel: "Cancelar",
  save: "Guardar",
  saving: "Guardando...",
};

interface CrudConfig<F> {
  endpoint: string; // e.g. /api/apiHandler/skill
  listKey: string; // key of the array in GET /endpoint/user/:id
  initialForm: F;
  validate: (data: F) => FormErrors<F>;
  wrapBody?: boolean; // send { formData } instead of the raw object
  messages: {
    loadError: string;
    added: string;
    addError: string;
    updated: string;
    updateError: string;
    confirmDelete: string;
    deleted: string;
    deleteError: string;
  };
}

function focusFirstInvalid(preferId?: string) {
  requestAnimationFrame(() => {
    const el =
      (preferId && document.getElementById(preferId)) ||
      document.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

const notifyProfileChanged = () => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));

// List + add/edit/delete state shared by the profile sections.
export function useProfileCrud<T extends { id: string }, F>(config: CrudConfig<F>) {
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const { endpoint, listKey, initialForm, validate, wrapBody, messages } = config;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<F>(initialForm);
  const [errors, setErrors] = useState<FormErrors<F>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !userId || lastFetchedUserIdRef.current === userId) return;
    lastFetchedUserIdRef.current = userId;
    setLoading(true);
    fetch(`${endpoint}/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setItems(data[listKey] || []))
      .catch((error) => {
        console.error(`Error fetching ${listKey}:`, error);
        Message.errorMessage(messages.loadError);
      })
      .finally(() => setLoading(false));
  }, [status, userId, endpoint, listKey, messages.loadError]);

  const setField = <K extends keyof F>(name: K, value: F[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Validate a single field when it loses focus.
  const blurField = (name: keyof F, value: unknown) => {
    const error = validate({ ...formData, [name]: value })[name];
    if (error) setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isValid = (preferId?: string) => {
    const newErrors = validate(formData);
    setErrors(newErrors);
    const valid = Object.values(newErrors).every((e) => !e);
    if (!valid) focusFirstInvalid(preferId);
    return valid;
  };

  const save = async (id: string | null, preferId?: string) => {
    if (!isValid(preferId) || !userId) return;
    setRefreshing(true);
    setErrors({});
    const payload = { ...formData, userId };
    try {
      const res = await fetch(id ? `${endpoint}/${id}` : endpoint, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wrapBody ? { formData: payload } : payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error: ${res.status}`);
      }
      const data = await res.json();
      if (!data?.resultado?.success || !data?.resultado?.data) {
        throw new Error(data?.error || data?.resultado?.data || (id ? messages.updateError : messages.addError));
      }
      const saved: T = data.resultado.data;
      setItems((prev) => (id ? prev.map((item) => (item.id === id ? saved : item)) : [...prev, saved]));
      Message.successMessage(id ? messages.updated : messages.added);
      notifyProfileChanged();
      if (id) {
        setEditingId(null);
      } else {
        setFormData(initialForm);
        setIsAddOpen(false);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : id ? messages.updateError : messages.addError;
      setErrors({ general: errorMessage } as FormErrors<F>);
      Message.errorMessage(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(messages.confirmDelete)) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data?.resultado?.success) {
        throw new Error(data?.error || data?.resultado?.data || messages.deleteError);
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      Message.successMessage(messages.deleted);
      notifyProfileChanged();
    } catch (error) {
      console.error(error);
      Message.errorMessage(messages.deleteError);
    } finally {
      setRefreshing(false);
    }
  };

  return {
    items,
    loading,
    refreshing,
    formData,
    setFormData,
    errors,
    editingId,
    isAddOpen,
    setIsAddOpen,
    setField,
    blurField,
    add: (preferId?: string) => save(null, preferId),
    update: (id: string, preferId?: string) => save(id, preferId),
    remove,
    openAdd: () => {
      setEditingId(null);
      setFormData(initialForm);
      setErrors({});
      setIsAddOpen(true);
    },
    startEdit: (id: string, form: F) => {
      setEditingId(id);
      setFormData(form);
      setErrors({});
    },
    cancelEdit: () => {
      setEditingId(null);
      setFormData(initialForm);
      setErrors({});
    },
  };
}

export function GeneralError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

// Small uppercase label used above groups ("REDES SOCIALES", skill levels...).
export function Eyebrow({ icon: Icon, children, className }: { icon?: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
      {children}
    </p>
  );
}

interface SectionCrud {
  loading: boolean;
  refreshing: boolean;
  isAddOpen: boolean;
  setIsAddOpen: (open: boolean) => void;
  openAdd: () => void;
  errors: { general?: string };
}

// Numbered section ("01 Experiencia") with an add button and its add dialog.
export function ProfileSection({
  index,
  title,
  aside,
  addLabel,
  dialogTitle,
  crud,
  form,
  onSave,
  labels = DEFAULT_LABELS,
  size = "lg",
  className,
  children,
}: {
  index?: string;
  title: string;
  aside?: React.ReactNode;
  addLabel: string;
  dialogTitle: string;
  crud: SectionCrud;
  form: React.ReactNode;
  onSave: () => void;
  labels?: ActionLabels;
  size?: "lg" | "sm";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <div className={cn("flex items-center justify-between gap-3", size === "lg" ? "mb-6" : "mb-4")}>
        {index ? (
          <h2 className="flex items-baseline gap-3">
            <span className="font-serif text-sm italic text-muted-foreground">{index}</span>
            <span className={cn("font-semibold tracking-tight", size === "lg" ? "text-2xl" : "text-xl")}>{title}</span>
          </h2>
        ) : (
          <Eyebrow>{title}</Eyebrow>
        )}
        <div className="flex items-center gap-3">
          {aside && <span className="hidden text-sm text-muted-foreground sm:inline">{aside}</span>}
          {!crud.loading && (
            <Button size="sm" variant="outline" className="h-8 shadow-sm" onClick={crud.openAdd}>
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="sr-only sm:not-sr-only">{addLabel}</span>
            </Button>
          )}
        </div>
      </div>

      {crud.loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        children
      )}

      <Dialog open={crud.isAddOpen} onOpenChange={crud.setIsAddOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
          <GeneralError message={crud.errors.general} />
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {form}
          </form>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => crud.setIsAddOpen(false)} disabled={crud.refreshing}>
              {labels.cancel}
            </Button>
            <Button onClick={onSave} disabled={crud.refreshing} className="bg-primary hover:bg-primary/90">
              {crud.refreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {labels.saving}
                </>
              ) : (
                labels.save
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  text,
  actionLabel,
  onAdd,
}: {
  icon: React.ElementType;
  text: string;
  actionLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed py-8 text-center">
      <Icon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground">{text}</p>
      <Button onClick={onAdd} variant="outline" size="sm" className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        {actionLabel}
      </Button>
    </div>
  );
}

export function IconAction({
  tip,
  onClick,
  disabled,
  variant = "ghost",
  children,
}: {
  tip: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "ghost" | "outline";
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size="icon" onClick={onClick} disabled={disabled} className="h-7 w-7" aria-label={tip}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Edit/delete buttons (shown on hover on desktop), or cancel/save while editing.
export function ItemActions({
  isEditing,
  isLoading,
  onEdit,
  onDelete,
  onCancel,
  onSave,
  labels = DEFAULT_LABELS,
  className,
}: {
  isEditing: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
  labels?: ActionLabels;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5",
        !isEditing && "transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100",
        className
      )}
    >
      {isEditing ? (
        <>
          <IconAction tip={labels.cancel} onClick={onCancel} disabled={isLoading} variant="outline">
            <X className="h-3.5 w-3.5 text-destructive" />
          </IconAction>
          <IconAction tip={labels.save} onClick={onSave} disabled={isLoading} variant="outline">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckIcon className="h-3.5 w-3.5 text-green-600" />}
          </IconAction>
        </>
      ) : (
        <>
          <IconAction tip={labels.edit} onClick={onEdit} disabled={isLoading}>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </IconAction>
          <IconAction tip={labels.delete} onClick={onDelete} disabled={isLoading}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </IconAction>
        </>
      )}
    </div>
  );
}

// Inline edit form container used inside list items.
export function InlineEditor({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-primary/20 bg-muted/40 p-4">
      <GeneralError message={error} />
      {children}
    </div>
  );
}

export function FieldShell({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          error ? "text-destructive" : "text-foreground",
          required && "after:content-['*'] after:ml-1 after:text-destructive"
        )}
      >
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm mt-1 animate-in slide-in-from-top-1 duration-200" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Labeled text input (or textarea when `rows` is set) with inline error.
export function TextField({
  id,
  label,
  value,
  error,
  required,
  disabled,
  type = "text",
  placeholder,
  rows,
  icon,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  rows?: number;
  icon?: React.ReactNode;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
}) {
  const props = {
    id,
    value,
    placeholder,
    disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onBlur: onBlur ? (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => onBlur(e.target.value) : undefined,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: cn(
      "bg-background transition-all duration-200",
      icon && "pl-9",
      error && "border-destructive ring-destructive focus:border-destructive focus:ring-destructive",
      disabled && "opacity-50 cursor-not-allowed"
    ),
  };

  return (
    <FieldShell id={id} label={label} error={error} required={required}>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        {rows ? <Textarea rows={rows} {...props} /> : <Input type={type} {...props} />}
      </div>
    </FieldShell>
  );
}

// "ene 2024" style label in the active UI locale.
export function formatMonthYear(value: string | null | undefined, locale: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(locale, { year: "numeric", month: "short" });
}

export const toDateInput = (value?: string | null) => (value ? new Date(value).toISOString().split("T")[0] : "");

// Splits a free-text description into display lines, flagging "- " bullets.
export function descriptionLines(text?: string | null) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ bullet: /^[-•*]\s+/.test(line), text: line.replace(/^[-•*]\s+/, "") }));
}

export function Description({ text, maxLines, className }: { text?: string | null; maxLines?: number; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = descriptionLines(text);
  if (lines.length === 0) return null;
  const visible = expanded || !maxLines ? lines : lines.slice(0, maxLines);

  return (
    <div className={cn("space-y-1.5 text-sm text-muted-foreground", className)}>
      {visible.map((line, i) =>
        line.bullet ? (
          <p key={i} className="relative pl-4 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-primary/60">
            {line.text}
          </p>
        ) : (
          <p key={i}>{line.text}</p>
        )
      )}
      {maxLines && lines.length > maxLines && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs font-medium text-primary hover:underline">
          {expanded ? "Ver menos" : `Ver más (${lines.length - maxLines})`}
        </button>
      )}
    </div>
  );
}

// Client-side paging state for a list.
export function usePagination<T>(items: T[], initialPageSize: number) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages); // stays valid after deletions
  return {
    pageItems: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    totalItems: items.length,
    currentPage,
    totalPages,
    pageSize,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };
}

const VISIBLE_PAGE_BUTTONS = 4;

// Sliding window of page numbers, with ellipses where pages are hidden.
function getPageItems(current: number, total: number): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (total <= VISIBLE_PAGE_BUTTONS + 1) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const start = Math.min(Math.max(1, current - 1), total - VISIBLE_PAGE_BUTTONS + 1);
  const end = start + VISIBLE_PAGE_BUTTONS - 1;
  return [
    ...(start > 1 ? ["ellipsis-start" as const] : []),
    ...Array.from({ length: VISIBLE_PAGE_BUTTONS }, (_, i) => start + i),
    ...(end < total ? ["ellipsis-end" as const] : []),
  ];
}

// "Page 1 of 10 · ‹ 1 2 3 4 … › · 10 / page". `stacked` fits narrow columns.
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  setPage,
  setPageSize,
  options,
  label,
  variant = "row",
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  options: number[];
  label: string;
  variant?: "row" | "stacked";
}) {
  const { t } = useI18n();
  if (totalItems <= options[0]) return null;

  const pageLabel = (
    <span className="text-sm text-muted-foreground">
      {t("profile.skills.page_of")
        .split(/(\{current\}|\{total\})/)
        .map((part, i) =>
          part === "{current}" || part === "{total}" ? (
            <span key={i} className="font-medium text-foreground">
              {part === "{current}" ? currentPage : totalPages}
            </span>
          ) : (
            part
          )
        )}
    </span>
  );

  const nav = (
    <nav className="flex items-center justify-center gap-1" aria-label={label}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t("profile.skills.previous")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {getPageItems(currentPage, totalPages).map((item) =>
        typeof item === "number" ? (
          <Button
            key={item}
            variant={item === currentPage ? "outline" : "ghost"}
            size="icon"
            className={cn("h-8 w-8", item === currentPage && "bg-card shadow-sm")}
            onClick={() => setPage(item)}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </Button>
        ) : (
          <span key={item} className="flex h-8 w-8 items-center justify-center" aria-hidden>
            <MoreHorizontal className="h-4 w-4" />
          </span>
        )
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t("profile.skills.next")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );

  const sizeSelect = (
    <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
      <SelectTrigger className="h-8 w-[110px] bg-card shadow-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((size) => (
          <SelectItem key={size} value={String(size)}>
            {t("profile.skills.per_page").replace("{size}", String(size))}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (variant === "stacked") {
    return (
      <div className="space-y-3 border-t pt-4">
        {nav}
        <div className="flex items-center justify-between gap-3">
          {pageLabel}
          {sizeSelect}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
      {pageLabel}
      {nav}
      {sizeSelect}
    </div>
  );
}

// Uploads an image to the server right away and reports its URL.
export function ImageField({
  id,
  label,
  value,
  folder,
  shape = "wide",
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  folder: "projects" | "education";
  shape?: "wide" | "square";
  disabled?: boolean;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/upload/image", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Error al subir la imagen");
      onChange(data.url);
    } catch (error) {
      Message.errorMessage(error instanceof Error ? error.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <FieldShell id={id} label={label}>
      <div className={cn("flex gap-3", shape === "wide" ? "flex-col" : "items-center")}>
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground",
            shape === "wide" ? "h-32 w-full" : "h-16 w-16 shrink-0"
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={disabled || uploading}>
            <label htmlFor={id} className="cursor-pointer">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
              {value ? "Cambiar imagen" : "Subir imagen"}
            </label>
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" disabled={disabled || uploading} onClick={() => onChange("")}>
              Quitar
            </Button>
          )}
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) upload(file);
            }}
          />
          <span className="w-full text-xs text-muted-foreground">JPG, PNG, WebP o GIF · máx. 2MB</span>
        </div>
      </div>
    </FieldShell>
  );
}

// Controlled dialog for editing an existing record.
export function EditDialog({
  open,
  title,
  error,
  saving,
  onCancel,
  onSave,
  labels = DEFAULT_LABELS,
  children,
}: {
  open: boolean;
  title: string;
  error?: string;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  labels?: ActionLabels;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl">{title}</DialogTitle>
        <GeneralError message={error} />
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {children}
        </form>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            {labels.cancel}
          </Button>
          <Button onClick={onSave} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {labels.saving}
              </>
            ) : (
              labels.save
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
