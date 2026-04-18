import "server-only";

import {
  EVER_JOBS_DEFAULT_TIMEOUT_MS,
  EVER_JOBS_DEFAULT_SELECTED_SITES,
  EVER_JOBS_FALLBACK_ALLOWED_SITES,
  EVER_JOBS_MAX_PAGE_SIZE,
} from "./constants";

function parseAllowedSites(value: string | undefined) {
  const normalized = value
    ?.split(",")
    .map((site) => site.trim().toLowerCase())
    .filter(Boolean);

  return normalized && normalized.length > 0
    ? Array.from(new Set(normalized))
    : [...EVER_JOBS_FALLBACK_ALLOWED_SITES];
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

const allowedSites = parseAllowedSites(process.env.EVER_JOBS_ALLOWED_SITES);

export const everJobsConfig = {
  apiUrl: process.env.EVER_JOBS_API_URL?.trim() ?? "",
  apiKey: process.env.EVER_JOBS_API_KEY?.trim() ?? "",
  defaultCountry: process.env.EVER_JOBS_DEFAULT_COUNTRY?.trim() || "USA",
  defaultPageSize: Math.min(
    parsePositiveInt(process.env.EVER_JOBS_DEFAULT_PAGE_SIZE, 10),
    EVER_JOBS_MAX_PAGE_SIZE,
  ),
  allowedSites,
  defaultSites: EVER_JOBS_DEFAULT_SELECTED_SITES.filter((site) =>
    allowedSites.includes(site),
  ),
  timeoutMs: parsePositiveInt(
    process.env.EVER_JOBS_TIMEOUT_MS,
    EVER_JOBS_DEFAULT_TIMEOUT_MS,
  ),
};

export function assertEverJobsConfig() {
  if (!everJobsConfig.apiUrl) {
    throw new Error("EVER_JOBS_API_URL is not configured");
  }

  return everJobsConfig;
}
