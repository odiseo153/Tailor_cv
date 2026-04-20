"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, ShieldCheck } from "lucide-react";

import { useI18n } from "@/app/context/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import type {
  JobSearchPagination,
  TailorCVJob,
  TailorCVJobSearchResult,
} from "@/lib/ever-jobs/types";
import JobResultsList from "./JobResultsList";
import JobSearchEmptyState from "./JobSearchEmptyState";
import JobSearchErrorState from "./JobSearchErrorState";
import JobSearchForm from "./JobSearchForm";
import JobSearchSkeleton from "./JobSearchSkeleton";

type SearchState = "idle" | "loading" | "success" | "empty" | "error";
type AvailabilityState = "checking" | "available" | "unavailable";

type JobSearchFormValues = {
  searchTerm: string;
  location: string;
  isRemote: boolean;
  pageSize: number;
  sites: string[];
};

const initialPagination: JobSearchPagination = {
  count: 0,
  currentPage: 1,
  pageSize: 10,
  totalPages: null,
  nextPage: null,
  previousPage: null,
};

type JobSearchSectionProps = {
  initialPageSize: number;
  initialSites: string[];
  allowedSites: string[];
};

async function parseResponse(response: Response, t: (key: string) => string) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // Show the real server error first, with the i18n label as context
    const serverMsg = payload?.error as string | undefined;
    const label = t("job_search.states.error");
    const message = serverMsg ? `${label}: ${serverMsg}` : label;

    throw new Error(message);
  }

  return payload as TailorCVJobSearchResult;
}

export default function JobSearchSection({
  initialPageSize,
  initialSites,
  allowedSites,
}: JobSearchSectionProps) {
  const { t } = useI18n();
  const [formValues, setFormValues] = useState<JobSearchFormValues>({
    searchTerm: "",
    location: "",
    isRemote: false,
    pageSize: initialPageSize,
    sites: initialSites,
  });
  const [status, setStatus] = useState<SearchState>("idle");
  const [jobs, setJobs] = useState<TailorCVJob[]>([]);
  const [pagination, setPagination] = useState<JobSearchPagination>(initialPagination);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>("checking");
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

  const isSubmitting = status === "loading";
  const isSearchDisabled = availabilityState !== "available";

  const heroStats = useMemo(
    () => [
      {
        icon: BriefcaseBusiness,
        value: t("job_search.hero.curated_sources_value"),
        label: t("job_search.hero.curated_sources_label"),
      },
      {
        icon: ShieldCheck,
        value: t("job_search.hero.secure_proxy_value"),
        label: t("job_search.hero.secure_proxy_label"),
      },
    ],
    [t],
  );

  const performSearch = async (page: number, append = false) => {
    if (availabilityState !== "available") {
      setStatus("error");
      setErrorMessage(
        availabilityMessage || t("job_search.states.server_unavailable"),
      );
      return;
    }

    const payload = {
      searchTerm: formValues.searchTerm.trim(),
      location: formValues.location.trim(),
      isRemote: formValues.isRemote,
      page,
      pageSize: formValues.pageSize,
      sites: formValues.sites,
    };

    if (payload.searchTerm.length < 2) {
      setValidationMessage(t("job_search.validation.search_term"));
      setStatus("idle");
      return;
    }

    if (payload.sites.length === 0) {
      setValidationMessage(t("job_search.validation.sites"));
      setStatus("idle");
      return;
    }

    setValidationMessage(null);
    setErrorMessage(null);

    if (append) {
      setIsLoadingMore(true);
    } else {
      setStatus("loading");
      setJobs([]);
      setPagination({
        ...initialPagination,
        pageSize: formValues.pageSize,
      });
    }

    try {
      const response = await fetch("/api/job-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await parseResponse(response, t);

      setJobs((currentJobs) =>
        append ? [...currentJobs, ...result.jobs] : result.jobs,
      );
      setPagination(result.pagination);
      setStatus(result.jobs.length > 0 || append ? "success" : "empty");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("job_search.states.error");

      if (append) {
        setErrorMessage(message);
      } else {
        setStatus("error");
        setErrorMessage(message);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const onSearch = () => {
    void performSearch(1, false);
  };

  const onLoadMore = () => {
    if (!pagination.nextPage || isLoadingMore) {
      return;
    }

    void performSearch(pagination.nextPage, true);
  };

  useEffect(() => {
    let cancelled = false;

    const checkAvailability = async () => {
      try {
        const response = await fetch("/api/job-search", {
          method: "GET",
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.available !== true) {
          const serverMsg = payload?.error as string | undefined;
          const label = t("job_search.states.server_unavailable");
          throw new Error(serverMsg ? `${label}: ${serverMsg}` : label);
        }

        if (!cancelled) {
          setAvailabilityState("available");
          setAvailabilityMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setAvailabilityState("unavailable");
          setAvailabilityMessage(
            error instanceof Error
              ? error.message
              : t("job_search.states.server_unavailable"),
          );
        }
      }
    };

    void checkAvailability();

    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_38%),linear-gradient(135deg,_#0f172a_0%,_#1e293b_55%,_#334155_100%)] px-6 py-10 text-white shadow-xl shadow-slate-300/60 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-slate-100">
              {t("job_search.hero.badge")}
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {t("job_search.hero.title")}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                {t("job_search.hero.description")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {heroStats.map((item) => (
              <Card
                key={item.label}
                className="border-white/10 bg-white/10 text-white shadow-none backdrop-blur"
              >
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="rounded-xl bg-white/10 p-2">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{item.value}</p>
                    <p className="text-sm text-slate-200">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <JobSearchForm
            values={formValues}
            availableSites={allowedSites}
            onChange={setFormValues}
            onSubmit={onSearch}
            isSubmitting={isSubmitting}
            isDisabled={isSearchDisabled}
            validationMessage={validationMessage}
            t={t}
          />
        </div>

        <div className="space-y-6">
          {availabilityState === "checking" ? <JobSearchSkeleton /> : null}

          {availabilityState === "unavailable" ? (
            <JobSearchErrorState
              title={t("job_search.states.server_unavailable_title")}
              description={
                availabilityMessage || t("job_search.states.server_unavailable")
              }
            />
          ) : null}

          {availabilityState === "available" && status === "idle" ? (
            <JobSearchEmptyState
              title={t("job_search.states.idle_title")}
              description={t("job_search.states.idle_description")}
            />
          ) : null}

          {availabilityState === "available" && status === "loading" ? (
            <JobSearchSkeleton />
          ) : null}

          {availabilityState === "available" && status === "error" ? (
            <JobSearchErrorState
              title={t("job_search.states.error_title")}
              description={errorMessage || t("job_search.states.error")}
            />
          ) : null}

          {availabilityState === "available" && status === "empty" ? (
            <JobSearchEmptyState
              title={t("job_search.states.empty_title")}
              description={t("job_search.states.empty")}
            />
          ) : null}

          {availabilityState === "available" && status === "success" ? (
            <>
              {errorMessage ? (
                <JobSearchErrorState
                  title={t("job_search.states.load_more_error_title")}
                  description={errorMessage}
                />
              ) : null}
              <JobResultsList
                jobs={jobs}
                pagination={pagination}
                isLoadingMore={isLoadingMore}
                onLoadMore={onLoadMore}
                t={t}
              />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
