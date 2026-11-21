"use client"

import React, { memo, useState } from "react";
import { Mail, MapPin, PencilIcon, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/app/context/I18nContext";
import { cn } from "@/lib/utils";

export interface ProfileDetails {
  headline?: string | null;
  summary?: string | null;
  counts: { experience: number; projects: number; skills: number };
}

interface ProfileViewProps {
  user: any;
  details?: ProfileDetails | null;
  onEdit?: () => void;
  className?: string;
}

const SUMMARY_PREVIEW_PARAGRAPHS = 2;

// Identity card: avatar, name, headline, contact, summary and record counters.
const ProfileView = memo<ProfileViewProps>(({ user, details, onEdit, className }) => {
  const { t } = useI18n();
  const [showFullSummary, setShowFullSummary] = useState(false);
  if (!user) return null;

  const paragraphs = (details?.summary ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const visibleParagraphs = showFullSummary ? paragraphs : paragraphs.slice(0, SUMMARY_PREVIEW_PARAGRAPHS);
  const stats = details
    ? [
        { value: details.counts.experience, label: t("profile.layout.stats_experience") },
        { value: details.counts.projects, label: t("profile.layout.stats_projects") },
        { value: details.counts.skills, label: t("profile.layout.stats_skills") },
      ]
    : [];

  return (
    <div className={cn("relative rounded-2xl border bg-card p-6 shadow-sm", className)}>
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="absolute right-3 top-3 h-8 w-8"
          aria-label={t("profile.personal_info.edit")}
        >
          <PencilIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}

      <Avatar className="h-24 w-24 border-4 border-background shadow-md ring-2 ring-primary/20">
        <AvatarImage src={user.profilePicture || user.image || ""} alt={user.name} loading="lazy" />
        <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">{user.name}</h1>
      {details?.headline && <p className="mt-1 text-sm font-medium text-primary">{details.headline}</p>}

      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        {user.location && (
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{user.location}</span>
          </li>
        )}
        {user.email && (
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{user.email}</span>
          </li>
        )}
        {user.phone && (
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{user.phone}</span>
          </li>
        )}
      </ul>

      {paragraphs.length > 0 && (
        <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {visibleParagraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {paragraphs.length > SUMMARY_PREVIEW_PARAGRAPHS && (
            <button
              type="button"
              onClick={() => setShowFullSummary((v) => !v)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {showFullSummary ? t("profile.layout.show_less") : t("profile.layout.show_more")}
            </button>
          )}
        </div>
      )}

      {stats.length > 0 && (
        <dl className="mt-6 grid grid-cols-3 gap-2 border-t pt-5">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-serif text-2xl leading-none">{stat.value}</dd>
              <p className="mt-1.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
});

ProfileView.displayName = "ProfileView";

export default ProfileView;
