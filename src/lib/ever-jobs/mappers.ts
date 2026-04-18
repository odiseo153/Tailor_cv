import type { EverJobsSearchResponse } from "./schemas";
import type { TailorCVJob, TailorCVJobSearchResult } from "./types";

function formatLocationLabel(
  location: EverJobsSearchResponse["jobs"][number]["location"],
): string | null {
  if (!location) {
    return null;
  }

  const parts = [location.city, location.state, location.country].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

function formatSalaryLabel(
  compensation: EverJobsSearchResponse["jobs"][number]["compensation"],
): string | null {
  if (!compensation || !compensation.currency) {
    return null;
  }

  const intervalMap: Record<string, string> = {
    hourly: "/hr",
    daily: "/day",
    weekly: "/wk",
    monthly: "/mo",
    yearly: "/yr",
  };

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: compensation.currency,
    maximumFractionDigits: 0,
  });

  const min = compensation.minAmount ?? null;
  const max = compensation.maxAmount ?? null;
  const intervalSuffix = compensation.interval
    ? ` ${intervalMap[compensation.interval] ?? `/${compensation.interval}`}`
    : "";

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}${intervalSuffix}`;
  }

  if (min) {
    return `${formatter.format(min)}${intervalSuffix}`;
  }

  if (max) {
    return `${formatter.format(max)}${intervalSuffix}`;
  }

  return null;
}

function stripMarkdown(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createDescriptionSnippet(description: string | null | undefined) {
  if (!description) {
    return null;
  }

  const stripped = stripMarkdown(description);

  if (!stripped) {
    return null;
  }

  if (stripped.length <= 180) {
    return stripped;
  }

  return `${stripped.slice(0, 177).trimEnd()}...`;
}

function mapJob(job: EverJobsSearchResponse["jobs"][number]): TailorCVJob {
  return {
    id: String(job.id),
    title: job.title?.trim() || "Untitled role",
    companyName: job.companyName?.trim() || null,
    locationLabel: formatLocationLabel(job.location),
    isRemote: Boolean(job.isRemote),
    source: job.site?.trim() || null,
    jobUrl: job.jobUrl,
    postedAt: job.datePosted || null,
    salaryLabel: formatSalaryLabel(job.compensation),
    descriptionSnippet: createDescriptionSnippet(job.description),
    logoUrl: job.logoUrl || null,
  };
}

export function mapEverJobsResponse(
  payload: EverJobsSearchResponse,
): TailorCVJobSearchResult {
  return {
    jobs: payload.jobs.map(mapJob),
    pagination: {
      count: payload.count,
      currentPage: payload.current_page ?? 1,
      pageSize: payload.page_size ?? payload.jobs.length,
      totalPages: payload.total_pages ?? null,
      nextPage: payload.next_page ?? null,
      previousPage: payload.previous_page ?? null,
    },
    cached: payload.cached ?? false,
  };
}
