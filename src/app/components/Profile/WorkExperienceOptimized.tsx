"use client"

import React, { memo } from "react";
import { Briefcase } from "lucide-react";
import { useI18n } from "@/app/context/I18nContext";
import { cn } from "@/lib/utils";
import {
  Description,
  EmptyState,
  FormErrors,
  InlineEditor,
  ItemActions,
  ProfileSection,
  TextField,
  formatMonthYear,
  toDateInput,
  useProfileCrud,
} from "./ProfileSection";

interface WorkExperience {
  id: string;
  company: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface WorkExperienceForm {
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  description: string;
}

const validate = (data: WorkExperienceForm): FormErrors<WorkExperienceForm> => ({
  company: data.company?.trim() ? undefined : "La empresa es requerida",
  jobTitle: data.jobTitle?.trim() ? undefined : "El puesto es requerido",
  startDate: data.startDate ? undefined : "La fecha de inicio es requerida",
  endDate:
    data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)
      ? "La fecha de fin no puede ser anterior a la fecha de inicio"
      : undefined,
});

const WorkExperienceInfo = memo<{ className?: string }>(({ className }) => {
  const { t, locale } = useI18n();
  const present = t("profile.layout.present");
  const crud = useProfileCrud<WorkExperience, WorkExperienceForm>({
    endpoint: "/api/apiHandler/work",
    listKey: "experiences",
    initialForm: { company: "", jobTitle: "", startDate: toDateInput(new Date().toISOString()), endDate: "", description: "" },
    validate,
    wrapBody: true,
    messages: {
      loadError: "Error al cargar experiencias laborales",
      added: "Experiencia agregada correctamente",
      addError: "Error al agregar experiencia",
      updated: "Experiencia actualizada correctamente",
      updateError: "Error al actualizar experiencia",
      confirmDelete: "¿Estás seguro de eliminar esta experiencia laboral?",
      deleted: "Experiencia eliminada correctamente",
      deleteError: "Error al eliminar la experiencia",
    },
  });
  const { formData, errors, refreshing } = crud;

  // Most recent first.
  const experiences = [...crud.items].sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));

  // Overall span shown in the section header, e.g. "2021 — hoy".
  const years = experiences.map((e) => new Date(e.startDate).getFullYear());
  const isCurrent = experiences.some((e) => !e.endDate);
  const lastYear = Math.max(...experiences.map((e) => new Date(e.endDate || e.startDate).getFullYear()));
  const span = experiences.length
    ? `${Math.min(...years)} — ${isCurrent ? present : lastYear}`
    : undefined;

  const field = (
    prefix: string,
    name: keyof WorkExperienceForm,
    label: string,
    extra: Partial<React.ComponentProps<typeof TextField>> = {}
  ) => (
    <TextField
      id={`${prefix}-${name}`}
      label={label}
      value={formData[name]}
      error={errors[name]}
      disabled={refreshing}
      onChange={(value) => crud.setField(name, value)}
      onBlur={(value) => crud.blurField(name, value)}
      {...extra}
    />
  );

  const renderForm = (prefix: string) => (
    <div className="space-y-4">
      {field(prefix, "company", "Empresa", { placeholder: "Nombre de la empresa", required: true })}
      {field(prefix, "jobTitle", "Puesto", { placeholder: "Título del puesto", required: true })}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field(prefix, "startDate", "Fecha de inicio", { type: "date", required: true })}
        {field(prefix, "endDate", "Fecha de fin", { type: "date", placeholder: "Dejar vacío si es actual" })}
      </div>
      {field(prefix, "description", "Descripción", { placeholder: "Describe tus responsabilidades y logros", rows: 5 })}
    </div>
  );

  return (
    <ProfileSection
      className={className}
      index="01"
      title={t("profile.work_experience.title")}
      aside={span}
      addLabel="Agregar"
      dialogTitle="Agregar Experiencia Laboral"
      crud={crud}
      form={renderForm("add")}
      onSave={() => crud.add()}
    >
      {experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          text="No has agregado experiencias laborales todavía."
          actionLabel="Agregar primera experiencia"
          onAdd={crud.openAdd}
        />
      ) : (
        <ol className="relative ml-1.5 border-l border-border">
          {experiences.map((exp, i) => {
            const isEditing = crud.editingId === exp.id;
            return (
              <li key={exp.id} className="group relative pb-8 pl-7 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary ring-4 ring-background",
                    i === 0 && !exp.endDate ? "bg-primary" : "bg-background"
                  )}
                />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-snug sm:text-base">{exp.jobTitle}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ItemActions
                      isEditing={isEditing}
                      isLoading={refreshing}
                      onEdit={() =>
                        crud.startEdit(exp.id, {
                          company: exp.company,
                          jobTitle: exp.jobTitle,
                          startDate: toDateInput(exp.startDate),
                          endDate: toDateInput(exp.endDate),
                          description: exp.description ?? "",
                        })
                      }
                      onDelete={() => crud.remove(exp.id)}
                      onCancel={crud.cancelEdit}
                      onSave={() => crud.update(exp.id)}
                    />
                    <span className="whitespace-nowrap pt-0.5 text-xs text-muted-foreground">
                      {formatMonthYear(exp.startDate, locale)} — {exp.endDate ? formatMonthYear(exp.endDate, locale) : present}
                    </span>
                  </div>
                </div>
                {isEditing ? (
                  <InlineEditor error={errors.general}>{renderForm(exp.id)}</InlineEditor>
                ) : (
                  <Description text={exp.description} maxLines={4} className="mt-3" />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </ProfileSection>
  );
});

WorkExperienceInfo.displayName = "WorkExperienceInfo";

export default WorkExperienceInfo;
