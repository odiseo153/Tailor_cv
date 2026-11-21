"use client"

import React, { memo } from "react";
import { ArrowUpRight, Facebook, Github, Globe, Instagram, Link as LinkIcon, Linkedin, Twitter, Youtube } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/app/context/I18nContext";
import {
  EmptyState,
  FormErrors,
  InlineEditor,
  ItemActions,
  ProfileSection,
  TextField,
  useProfileCrud,
} from "./ProfileSection";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface SocialLinkForm {
  platform: string;
  url: string;
}

const INITIAL_FORM: SocialLinkForm = { platform: "", url: "" };

const socialPlatforms = [
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, urlPattern: "linkedin.com" },
  { value: "github", label: "GitHub", icon: Github, urlPattern: "github.com" },
  { value: "twitter", label: "Twitter", icon: Twitter, urlPattern: "twitter.com" },
  { value: "instagram", label: "Instagram", icon: Instagram, urlPattern: "instagram.com" },
  { value: "facebook", label: "Facebook", icon: Facebook, urlPattern: "facebook.com" },
  { value: "youtube", label: "YouTube", icon: Youtube, urlPattern: "youtube.com" },
  { value: "other", label: "Otro", icon: Globe, urlPattern: "" },
];

const getPlatform = (value: string) =>
  socialPlatforms.find((p) => p.value === value) || socialPlatforms[socialPlatforms.length - 1];

const detectPlatformFromUrl = (url: string) =>
  socialPlatforms.find((p) => p.urlPattern && url.toLowerCase().includes(p.urlPattern))?.value || "other";

function validateUrl(url: string): string | undefined {
  if (!url) return "La URL es requerida";
  try {
    new URL(url);
  } catch {
    return "Por favor, introduce una URL válida";
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) return "La URL debe comenzar con http:// o https://";
}

const validate = (data: SocialLinkForm): FormErrors<SocialLinkForm> => ({
  platform: data.platform ? undefined : "La plataforma es requerida",
  url: validateUrl(data.url),
});

const SocialLinks = memo<{ className?: string }>(({ className }) => {
  const { t } = useI18n();
  const crud = useProfileCrud<SocialLink, SocialLinkForm>({
    endpoint: "/api/apiHandler/social",
    listKey: "socialLinks",
    initialForm: INITIAL_FORM,
    validate,
    messages: {
      loadError: "Error al cargar enlaces sociales",
      added: "Enlace social añadido correctamente",
      addError: "Error al añadir enlace social",
      updated: "Enlace social actualizado correctamente",
      updateError: "Error al actualizar enlace social",
      confirmDelete: "¿Estás seguro de eliminar este enlace social?",
      deleted: "Enlace social eliminado correctamente",
      deleteError: "Error al eliminar enlace social",
    },
  });
  const { formData, errors, refreshing } = crud;
  // Focus the platform selector first when it is the missing field.
  const preferId = (prefix: string) => (formData.platform ? undefined : `${prefix}-platform`);

  const sortedLinks = [...crud.items].sort((a, b) => a.platform.localeCompare(b.platform));

  const renderForm = (prefix: string) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-platform`} className="text-sm font-medium">
          Plataforma *
        </Label>
        <Select value={formData.platform} onValueChange={(value) => crud.setField("platform", value)}>
          <SelectTrigger id={`${prefix}-platform`} className={errors.platform ? "border-destructive" : ""}>
            <SelectValue placeholder="Selecciona una plataforma" />
          </SelectTrigger>
          <SelectContent>
            {socialPlatforms.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center">
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.platform && <p className="text-destructive text-sm">{errors.platform}</p>}
      </div>
      <TextField
        id={`${prefix}-url`}
        label="URL"
        placeholder="https://ejemplo.com/mi-perfil"
        required
        value={formData.url}
        error={errors.url}
        disabled={refreshing}
        icon={<LinkIcon className="h-4 w-4" />}
        onChange={(value) => {
          crud.setField("url", value);
          if (!formData.platform) crud.setField("platform", detectPlatformFromUrl(value));
        }}
        onBlur={(value) => crud.blurField("url", value)}
      />
    </div>
  );

  return (
    <ProfileSection
      className={className}
      size="sm"
      title={t("profile.social_links.title")}
      addLabel="Añadir"
      dialogTitle="Añadir Enlace Social"
      crud={crud}
      form={renderForm("add")}
      onSave={() => crud.add(preferId("add"))}
    >
      {sortedLinks.length === 0 ? (
        <EmptyState
          icon={LinkIcon}
          text="No has agregado enlaces sociales todavía."
          actionLabel="Añadir primer enlace social"
          onAdd={crud.openAdd}
        />
      ) : (
        <ul className="divide-y border-y">
          {sortedLinks.map((link) => {
            const isEditing = crud.editingId === link.id;
            const { label, icon: Icon } = getPlatform(link.platform);
            return (
              <li key={link.id} className="group py-2.5">
                <div className="flex items-center gap-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate font-medium text-foreground group-hover:text-primary">{label}</span>
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0" />
                  </a>
                  <ItemActions
                    isEditing={isEditing}
                    isLoading={refreshing}
                    onEdit={() => crud.startEdit(link.id, { platform: link.platform, url: link.url })}
                    onDelete={() => crud.remove(link.id)}
                    onCancel={crud.cancelEdit}
                    onSave={() => crud.update(link.id, preferId(link.id))}
                  />
                </div>
                {isEditing && <InlineEditor error={errors.general}>{renderForm(link.id)}</InlineEditor>}
              </li>
            );
          })}
        </ul>
      )}
    </ProfileSection>
  );
});

SocialLinks.displayName = "SocialLinks";

export default SocialLinks;
