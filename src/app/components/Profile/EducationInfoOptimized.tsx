"use client"

import React, { memo } from "react";
import { GraduationCap } from "lucide-react";
import { useI18n } from "@/app/context/I18nContext";
import {
  EmptyState,
  FormErrors,
  ImageField,
  InlineEditor,
  ItemActions,
  ProfileSection,
  TextField,
  formatMonthYear,
  toDateInput,
  useProfileCrud,
} from "./ProfileSection";

interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  image: string | null;
}

interface EducationForm {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  image: string;
}

const INITIAL_FORM: EducationForm = { institution: "", degree: "", startDate: "", endDate: "", image: "" };

const validate = (data: EducationForm): FormErrors<EducationForm> => ({
  institution: data.institution?.trim() ? undefined : "La institución es requerida",
  degree: data.degree?.trim() ? undefined : "El título o grado es requerido",
  startDate: data.startDate ? undefined : "La fecha de inicio es requerida",
  endDate:
    data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)
      ? "La fecha de finalización debe ser posterior a la fecha de inicio"
      : undefined,
});

const EducationInfo = memo<{ className?: string }>(({ className }) => {
  const { t, locale } = useI18n();
  const crud = useProfileCrud<Education, EducationForm>({
    endpoint: "/api/apiHandler/education",
    listKey: "education",
    initialForm: INITIAL_FORM,
    validate,
    messages: {
      loadError: "Error al cargar información educativa",
      added: "Información educativa añadida correctamente",
      addError: "Error al añadir información educativa",
      updated: "Información educativa actualizada correctamente",
      updateError: "Error al actualizar información educativa",
      confirmDelete: "¿Estás seguro de eliminar esta información educativa?",
      deleted: "Información educativa eliminada correctamente",
      deleteError: "Error al eliminar información educativa",
    },
  });
  const { formData, errors, refreshing } = crud;
  const education = [...crud.items].sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));

  const field = (
    prefix: string,
    name: Exclude<keyof EducationForm, "image">,
    label: string,
    extra: Partial<React.ComponentProps<typeof TextField>> = {}
  ) => (
    <TextField
      id={`${prefix}-edu-${name}`}
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
      <ImageField
        id={`${prefix}-edu-image`}
        label="Imagen o logo"
        folder="education"
        shape="square"
        value={formData.image}
        disabled={refreshing}
        onChange={(url) => crud.setField("image", url)}
      />
      {field(prefix, "institution", "Institución/Universidad", { placeholder: "Universidad / Instituto", required: true })}
      {field(prefix, "degree", "Título/Grado", { placeholder: "Licenciatura, Maestría, Doctorado, etc.", required: true })}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field(prefix, "startDate", "Fecha de inicio", { type: "date", required: true })}
        {field(prefix, "endDate", "Fecha de fin", { type: "date", placeholder: "Dejar vacío si es actual" })}
      </div>
    </div>
  );

  return (
    <ProfileSection
      className={className}
      index="03"
      title={t("profile.education.title")}
      addLabel="Añadir"
      dialogTitle="Añadir Educación"
      crud={crud}
      form={renderForm("add")}
      onSave={() => crud.add()}
    >
      {education.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          text="No has agregado información educativa todavía."
          actionLabel="Añadir educación"
          onAdd={crud.openAdd}
        />
      ) : (
        <ul className="space-y-5">
          {education.map((edu) => {
            const isEditing = crud.editingId === edu.id;
            return (
              <li key={edu.id} className="group flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-card text-primary shadow-sm">
                  {edu.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={edu.image} alt={edu.institution} className="h-full w-full object-cover" />
                  ) : (
                    <GraduationCap className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-snug sm:text-base">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ItemActions
                        isEditing={isEditing}
                        isLoading={refreshing}
                        onEdit={() =>
                          crud.startEdit(edu.id, {
                            institution: edu.institution,
                            degree: edu.degree,
                            startDate: toDateInput(edu.startDate),
                            endDate: toDateInput(edu.endDate),
                            image: edu.image ?? "",
                          })
                        }
                        onDelete={() => crud.remove(edu.id)}
                        onCancel={crud.cancelEdit}
                        onSave={() => crud.update(edu.id)}
                      />
                      <span className="whitespace-nowrap pt-0.5 text-xs text-muted-foreground">
                        {formatMonthYear(edu.startDate, locale)} —{" "}
                        {edu.endDate ? formatMonthYear(edu.endDate, locale) : t("profile.layout.present")}
                      </span>
                    </div>
                  </div>
                  {isEditing && <InlineEditor error={errors.general}>{renderForm(edu.id)}</InlineEditor>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ProfileSection>
  );
});

EducationInfo.displayName = "EducationInfo";

export default EducationInfo;
