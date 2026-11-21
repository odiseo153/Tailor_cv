"use client"

import React, { memo, useMemo } from "react";
import { LightbulbIcon, StarIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/app/context/I18nContext";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  Eyebrow,
  FieldShell,
  FormErrors,
  InlineEditor,
  ItemActions,
  Pagination,
  ProfileSection,
  TextField,
  usePagination,
  useProfileCrud,
} from "./ProfileSection";

interface Skill {
  id: string;
  name: string;
  level: number;
}

interface SkillForm {
  name: string;
  level: number;
}

const INITIAL_FORM: SkillForm = { name: "", level: 1 };
const PAGE_SIZE_OPTIONS = [5, 10,15, 20, 50];
const DEFAULT_PAGE_SIZE = 5;

function Stars({ level }: { level: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} className={cn("h-3 w-3", i < level ? "text-yellow-400 fill-current" : "text-gray-300")} />
      ))}
    </div>
  );
}

const Skills = memo<{ className?: string }>(({ className }) => {
  const { t } = useI18n();

  const validate = (data: SkillForm): FormErrors<SkillForm> => ({
    name: data.name?.trim() ? undefined : t("profile.skills.name_required"),
    level: !data.level
      ? t("profile.skills.level_required")
      : data.level < 1 || data.level > 5
        ? t("profile.skills.level_range")
        : undefined,
  });

  const crud = useProfileCrud<Skill, SkillForm>({
    endpoint: "/api/apiHandler/skill",
    listKey: "skills",
    initialForm: INITIAL_FORM,
    validate,
    messages: {
      loadError: t("profile.skills.error_loading"),
      added: t("profile.skills.added_successfully"),
      addError: t("profile.skills.error_adding"),
      updated: t("profile.skills.updated_successfully"),
      updateError: t("profile.skills.error_updating"),
      confirmDelete: t("profile.skills.confirm_delete"),
      deleted: t("profile.skills.deleted_successfully"),
      deleteError: t("profile.skills.error_deleting"),
    },
  });
  const { formData, errors, refreshing } = crud;
  const labels = {
    edit: t("profile.skills.edit"),
    delete: t("profile.skills.delete"),
    cancel: t("profile.personal_info.cancel"),
    save: t("profile.personal_info.save"),
    saving: t("profile.skills.saving"),
  };

  // Higher level first, then alphabetical.
  const sortedSkills = useMemo(
    () => [...crud.items].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name)),
    [crud.items]
  );

  const pagination = usePagination(sortedSkills, DEFAULT_PAGE_SIZE);
  const pagedSkills = pagination.pageItems;

  // Consecutive skills of the current page grouped by level band.
  const levelGroup = (level: number) =>
    level >= 4 ? t("profile.layout.level_advanced") : level === 3 ? t("profile.layout.level_intermediate") : t("profile.layout.level_basic");
  const groups = pagedSkills.reduce<{ label: string; skills: Skill[] }[]>((acc, skill) => {
    const label = levelGroup(skill.level);
    if (acc.at(-1)?.label === label) acc.at(-1)!.skills.push(skill);
    else acc.push({ label, skills: [skill] });
    return acc;
  }, []);

  const renderForm = (prefix: string) => (
    <div className="space-y-4">
      <TextField
        id={`${prefix}-name`}
        label={t("profile.skills.skill_name")}
        placeholder={t("profile.skills.skill_placeholder")}
        required
        value={formData.name}
        error={errors.name}
        disabled={refreshing}
        onChange={(value) => crud.setField("name", value)}
        onBlur={(value) => crud.blurField("name", value)}
      />
      <FieldShell id={`${prefix}-level`} label={`${t("profile.skills.level")} (${formData.level}/5)`} error={errors.level}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Stars level={formData.level} />
            <span className="text-sm text-muted-foreground">{formData.level}/5</span>
          </div>
          <Slider
            id={`${prefix}-level`}
            value={[formData.level]}
            min={1}
            max={5}
            step={1}
            onValueChange={(values) => crud.setField("level", values[0])}
            disabled={refreshing}
          />
        </div>
      </FieldShell>
    </div>
  );

  return (
    <ProfileSection
      className={className}
      index="04"
      size="sm"
      title={t("profile.skills.title")}
      addLabel={t("profile.skills.add")}
      dialogTitle={t("profile.skills.add_skill")}
      crud={crud}
      form={renderForm("add")}
      onSave={() => crud.add()}
      labels={{ ...labels, cancel: t("profile.skills.cancel"), save: t("profile.skills.save") }}
    >
      {sortedSkills.length === 0 ? (
        <EmptyState
          icon={LightbulbIcon}
          text={t("profile.skills.no_skills")}
          actionLabel={t("profile.skills.add_first")}
          onAdd={crud.openAdd}
        />
      ) : (
        <div className="space-y-5">
          {groups.map((group, gi) => (
            <div key={`${group.label}-${gi}`} className="space-y-3">
              <Eyebrow>{group.label}</Eyebrow>
              {group.skills.map((skill) => {
                const isEditing = crud.editingId === skill.id;
                return (
                  <div key={skill.id} className="group">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate font-medium">{skill.name}</span>
                      <div className="flex items-center gap-1">
                        <ItemActions
                          isEditing={isEditing}
                          isLoading={refreshing}
                          onEdit={() => crud.startEdit(skill.id, { name: skill.name, level: skill.level })}
                          onDelete={() => crud.remove(skill.id)}
                          onCancel={crud.cancelEdit}
                          onSave={() => crud.update(skill.id)}
                          labels={labels}
                        />
                        <span className="w-7 text-right text-xs tabular-nums text-muted-foreground">{skill.level}/5</span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${skill.level * 20}%` }} />
                    </div>
                    {isEditing && <InlineEditor error={errors.general}>{renderForm(skill.id)}</InlineEditor>}
                  </div>
                );
              })}
            </div>
          ))}
          <Pagination
            {...pagination}
            options={PAGE_SIZE_OPTIONS}
            variant="stacked"
            label={t("profile.skills.title")}
          />
        </div>
      )}
    </ProfileSection>
  );
});

Skills.displayName = "Skills";

export default Skills;
