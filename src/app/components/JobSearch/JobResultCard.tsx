"use client";

import { useMemo, useState } from "react";
import { Building2, ExternalLink, Globe2, MapPin, Wallet } from "lucide-react";

import { useI18n } from "@/app/context/I18nContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TailorCVJob } from "@/lib/ever-jobs/types";

type JobResultCardProps = {
  job: TailorCVJob;
};

function JobLogo({ companyName, logoUrl }: { companyName: string | null; logoUrl: string | null }) {
  const [hasError, setHasError] = useState(false);
  const fallbackLabel = useMemo(
    () => (companyName ? companyName.charAt(0).toUpperCase() : "J"),
    [companyName],
  );

  if (!logoUrl || hasError) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
        {fallbackLabel}
      </div>
    );
  }

  return (
    <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <img
        src={logoUrl}
        alt={companyName ? `${companyName} logo` : "Company logo"}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function JobResultCard({ job }: JobResultCardProps) {
  const { locale, t } = useI18n();

  const formattedDate = useMemo(() => {
    if (!job.postedAt) {
      return null;
    }

    const date = new Date(job.postedAt);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat(locale || "en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, [job.postedAt, locale]);

  return (
    <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4">
            <JobLogo companyName={job.companyName} logoUrl={job.logoUrl} />
            <div className="min-w-0 space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {job.companyName || t("job_search.results.company_fallback")}
                  </span>
                  {job.locationLabel ? (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {job.locationLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.isRemote ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {t("job_search.results.remote_badge")}
                  </Badge>
                ) : null}
                {job.source ? <Badge variant="outline">{job.source}</Badge> : null}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                {job.salaryLabel ? (
                  <span className="inline-flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-slate-400" />
                    {job.salaryLabel}
                  </span>
                ) : null}
                {formattedDate ? (
                  <span className="inline-flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-slate-400" />
                    {formattedDate}
                  </span>
                ) : null}
              </div>

              {job.descriptionSnippet ? (
                <p className="text-sm leading-6 text-slate-600">
                  {job.descriptionSnippet}
                </p>
              ) : null}
            </div>
          </div>

          <Button asChild className="md:shrink-0">
            <a href={job.jobUrl} target="_blank" rel="noreferrer">
              {t("job_search.results.view_offer")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
