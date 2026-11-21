"use client"

import React from "react";
import Link from "next/link";
import { Briefcase, BriefcaseBusiness, FileClock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/app/context/I18nContext";
import EducationInfo from "./EducationInfoOptimized";
import PersonalInfo from "./PersonalInfoOptimized";
import { Eyebrow } from "./ProfileSection";
import Projects from "./Projects";
import Skills from "./SkillsOptimized";
import SocialLinks from "./SocialLinksOptimized";
import WorkExperienceInfo from "./WorkExperienceOptimized";

// Two-column profile: identity, skills and links on the left; career sections on the right.
export default function ProfessionalProfile({ children }: { children?: React.ReactNode }) {
  const { t } = useI18n();
  const quickActions = [
    { href: "/generar-cv", icon: FileText, label: t("profile.quick_actions.generate_cv") },
    { href: "/buscar-trabajo", icon: BriefcaseBusiness, label: t("profile.quick_actions.job_search") },
    { href: "/cv-history", icon: FileClock, label: t("profile.quick_actions.cv_history") },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-14">
      <aside className="space-y-10">
        <PersonalInfo />
        <Skills />
        <SocialLinks />
      </aside>

      <div className="min-w-0 space-y-14">
        <header>
          <Eyebrow icon={Briefcase}>{t("profile.layout.eyebrow")}</Eyebrow>
          <p className="mt-4 max-w-2xl font-serif text-3xl leading-snug sm:text-4xl">
            {t("profile.layout.title")} <em className="text-primary">{t("profile.layout.title_accent")}</em>
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {quickActions.map(({ href, icon: Icon, label }) => (
              <Button key={href} asChild variant="outline" size="sm" className="bg-card shadow-sm">
                <Link href={href}>
                  <Icon className="mr-2 h-4 w-4 text-primary" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
          <div className="mt-8 border-t" />
        </header>

        <WorkExperienceInfo />
        <Projects />
        <EducationInfo />
        {children}
      </div>
    </div>
  );
}
