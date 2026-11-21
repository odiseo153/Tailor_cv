"use client"

import React, { memo, useState } from "react";
import { Code2, FolderKanban, Globe, LayoutDashboard, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/app/context/I18nContext";
import { cn } from "@/lib/utils";
import {
  Description,
  EditDialog,
  EmptyState,
  FormErrors,
  ImageField,
  ItemActions,
  Pagination,
  ProfileSection,
  TextField,
  descriptionLines,
  usePagination,
  useProfileCrud,
} from "./ProfileSection";

interface Project {
  id: string;
  name: string;
  role: string | null;
  description: string | null;
  technologies: string | null;
  image: string | null;
}

interface ProjectForm {
  name: string;
  role: string;
  description: string;
  technologies: string;
  image: string;
}

const INITIAL_FORM: ProjectForm = { name: "", role: "", description: "", technologies: "", image: "" };

// Cover tints cycle per card when there is no image; full class names so Tailwind keeps them.
const COVERS = [
  { bg: "from-blue-500/15 via-blue-500/5", fg: "text-blue-600", icon: Sparkles },
  { bg: "from-violet-500/15 via-violet-500/5", fg: "text-violet-600", icon: Code2 },
  { bg: "from-amber-500/15 via-amber-500/5", fg: "text-amber-600", icon: LayoutDashboard },
  { bg: "from-teal-500/15 via-teal-500/5", fg: "text-teal-600", icon: Globe },
];

const pad = (n: number) => String(n).padStart(2, "0");
const PAGE_SIZE_OPTIONS = [4, 8, 12, 20];
const DEFAULT_PAGE_SIZE = 4;
const MAX_VISIBLE_TAGS = 3;

const splitTags = (technologies: string | null) =>
  (technologies ?? "").split(",").map((s) => s.trim()).filter(Boolean);

function Cover({ project, index, className }: { project: Project; index: number; className?: string }) {
  const cover = COVERS[index % COVERS.length];
  const Icon = cover.icon;
  if (project.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={project.image} alt={project.name} className={cn("h-full w-full object-cover", className)} />;
  }
  return (
    <div className={cn("relative flex h-full items-center justify-center bg-gradient-to-br to-transparent", cover.bg, cover.fg, className)}>
      <span className="absolute h-40 w-40 rounded-full border border-current opacity-10" />
      <span className="absolute h-24 w-24 rounded-full border border-current opacity-15" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
}

const Projects = memo<{ className?: string }>(({ className }) => {
  const { t } = useI18n();
  const p = (key: string) => t(`profile.projects.${key}`);
  const [detailId, setDetailId] = useState<string | null>(null);

  const crud = useProfileCrud<Project, ProjectForm>({
    endpoint: "/api/apiHandler/project",
    listKey: "projects",
    initialForm: INITIAL_FORM,
    validate: (data): FormErrors<ProjectForm> => ({ name: data.name.trim() ? undefined : p("name_required") }),
    messages: {
      loadError: p("error_loading"),
      added: p("added"),
      addError: p("error_adding"),
      updated: p("updated"),
      updateError: p("error_updating"),
      confirmDelete: p("confirm_delete"),
      deleted: p("deleted"),
      deleteError: p("error_deleting"),
    },
  });
  const { formData, errors, refreshing } = crud;
  const labels = {
    edit: p("edit"),
    delete: p("delete"),
    cancel: p("cancel"),
    save: p("save"),
    saving: p("saving"),
  };

  const field = (prefix: string, name: Exclude<keyof ProjectForm, "image">, extra: { required?: boolean; rows?: number } = {}) => (
    <TextField
      id={`${prefix}-project-${name}`}
      label={p(name === "name" ? "project_name" : name)}
      placeholder={p(`${name}_placeholder`)}
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
        id={`${prefix}-project-image`}
        label={p("image")}
        folder="projects"
        value={formData.image}
        disabled={refreshing}
        onChange={(url) => crud.setField("image", url)}
      />
      {field(prefix, "name", { required: true })}
      {field(prefix, "role")}
      {field(prefix, "technologies")}
      {field(prefix, "description", { rows: 5 })}
    </div>
  );

  const total = crud.items.length;
  const pagination = usePagination(crud.items, DEFAULT_PAGE_SIZE);
  const firstIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const detailIndex = crud.items.findIndex((item) => item.id === detailId);
  const detail = detailIndex >= 0 ? crud.items[detailIndex] : null;

  return (
    <ProfileSection
      className={className}
      index="02"
      title={p("title")}
      aside={total ? `${total} ${p("count_label")}` : undefined}
      addLabel={p("add")}
      dialogTitle={p("add_project")}
      crud={crud}
      form={crud.editingId ? null : renderForm("add")}
      onSave={() => crud.add()}
      labels={labels}
    >
      {total === 0 ? (
        <EmptyState icon={FolderKanban} text={p("empty")} actionLabel={p("add_first")} onAdd={crud.openAdd} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {pagination.pageItems.map((project, pageIndex) => {
              const i = firstIndex + pageIndex; // position in the full list
              const tags = splitTags(project.technologies);
              const summary = descriptionLines(project.description).map((line) => line.text).join(" ");
              return (
                // Fixed height so every card has the same size regardless of content.
                <article
                  key={project.id}
                  className="group flex h-[380px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-32 shrink-0 overflow-hidden">
                    <Cover project={project} index={i} />
                    <span className="absolute left-3 top-2.5 rounded bg-background/80 px-1.5 text-[11px] font-medium text-muted-foreground">
                      {pad(i + 1)} / {pad(total)}
                    </span>
                    <ItemActions
                      className="absolute right-2 top-2 rounded-md bg-background/80"
                      isEditing={false}
                      isLoading={refreshing}
                      onEdit={() =>
                        crud.startEdit(project.id, {
                          name: project.name,
                          role: project.role ?? "",
                          description: project.description ?? "",
                          technologies: project.technologies ?? "",
                          image: project.image ?? "",
                        })
                      }
                      onDelete={() => crud.remove(project.id)}
                      onCancel={crud.cancelEdit}
                      onSave={() => crud.update(project.id)}
                      labels={labels}
                    />
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col p-5">
                    <p className="truncate text-xs text-muted-foreground">{project.role || " "}</p>
                    <h3 className="mt-1 truncate text-base font-semibold sm:text-base" title={project.name}>
                      {project.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{summary}</p>
                    <button
                      type="button"
                      onClick={() => setDetailId(project.id)}
                      className="mt-1 self-start text-xs font-medium text-primary hover:underline"
                    >
                      {p("view_details")}
                    </button>
                    <div className="mt-auto flex flex-nowrap gap-1.5 overflow-hidden pt-3">
                      {tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                        <span key={tag} className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                      {tags.length > MAX_VISIBLE_TAGS && (
                        <span className="shrink-0 rounded-md px-1 py-0.5 text-[11px] font-medium text-muted-foreground">
                          +{tags.length - MAX_VISIBLE_TAGS}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination {...pagination} options={PAGE_SIZE_OPTIONS} label={p("title")} />
        </div>
      )}

      <EditDialog
        open={crud.editingId !== null}
        title={p("edit_project")}
        error={errors.general}
        saving={refreshing}
        onCancel={crud.cancelEdit}
        onSave={() => crud.editingId && crud.update(crud.editingId)}
        labels={labels}
      >
        {crud.editingId && renderForm(crud.editingId)}
      </EditDialog>

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
          {detail && (
            <>
              <div className="h-44 overflow-hidden rounded-t-lg">
                <Cover project={detail} index={detailIndex} />
              </div>
              <div className="space-y-3 px-6 pb-6">
                {detail.role && <p className="text-xs text-muted-foreground">{detail.role}</p>}
                <DialogTitle className="text-xl">{detail.name}</DialogTitle>
                <Description text={detail.description} />
                <div className="flex flex-wrap gap-1.5">
                  {splitTags(detail.technologies).map((tag) => (
                    <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ProfileSection>
  );
});

Projects.displayName = "Projects";

export default Projects;
