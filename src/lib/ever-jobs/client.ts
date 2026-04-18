import "server-only";

import { EverJobsSearchResponseSchema, type JobSearchRequestInput } from "./schemas";
import { assertEverJobsConfig, everJobsConfig } from "./config";
import { mapEverJobsResponse } from "./mappers";
import type { TailorCVJobSearchResult } from "./types";

export class EverJobsClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "EverJobsClientError";
    this.status = status;
  }
}

function sanitizeSites(sites: string[] | undefined) {
  const normalized = Array.from(
    new Set(
      (sites ?? []).map((site) => site.trim().toLowerCase()).filter(Boolean),
    ),
  ).filter((site) => everJobsConfig.allowedSites.includes(site));

  if (normalized.length > 0) {
    return normalized;
  }

  if (everJobsConfig.defaultSites.length > 0) {
    return everJobsConfig.defaultSites;
  }

  return everJobsConfig.allowedSites;
}

export async function searchJobs(
  input: JobSearchRequestInput,
): Promise<TailorCVJobSearchResult> {
  const config = assertEverJobsConfig();
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? config.defaultPageSize;
  const siteType = sanitizeSites(input.sites);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  const searchParams = new URLSearchParams({
    format: "json",
    paginate: "true",
    page: String(page),
    page_size: String(pageSize),
  });

  try {
    const response = await fetch(
      `${config.apiUrl.replace(/\/$/, "")}/api/jobs/search?${searchParams.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey ? { "x-api-key": config.apiKey } : {}),
        },
        body: JSON.stringify({
          searchTerm: input.searchTerm,
          location: input.location,
          isRemote: input.isRemote ?? false,
          resultsWanted: pageSize,
          country: config.defaultCountry,
          descriptionFormat: "markdown",
          siteType,
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new EverJobsClientError("Ever Jobs request failed", response.status);
    }

    const payload = await response.json();
    const parsed = EverJobsSearchResponseSchema.safeParse(payload);

    if (!parsed.success) {
      throw new EverJobsClientError("Ever Jobs response validation failed", 502);
    }

    return mapEverJobsResponse(parsed.data);
  } catch (error) {
    if (error instanceof EverJobsClientError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new EverJobsClientError("Ever Jobs request timed out", 504);
    }

    throw new EverJobsClientError("Ever Jobs network failure", 502);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function pingEverJobsServer(): Promise<void> {
  const config = assertEverJobsConfig();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Math.min(config.timeoutMs, 10000));

  try {
    const response = await fetch(
      `${config.apiUrl.replace(/\/$/, "")}/ping`,
      {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new EverJobsClientError("Ever Jobs ping failed", response.status);
    }
  } catch (error) {
    if (error instanceof EverJobsClientError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new EverJobsClientError("Ever Jobs ping timed out", 504);
    }

    throw new EverJobsClientError("Ever Jobs ping network failure", 502);
  } finally {
    clearTimeout(timeoutId);
  }
}
