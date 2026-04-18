import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Configura el límite de timeout en Vercel a 60 segundos

import {
  searchJobs,
  pingEverJobsServer,
  EverJobsClientError,
} from "@/lib/ever-jobs/client";
import { JobSearchRequestSchema } from "@/lib/ever-jobs/schemas";
import { everJobsConfig } from "@/lib/ever-jobs/config";
import { EVER_JOBS_MAX_PAGE_SIZE } from "@/lib/ever-jobs/constants";

function buildSafeInput(input: ReturnType<typeof JobSearchRequestSchema.parse>) {
  return {
    ...input,
    page: input.page ?? 1,
    pageSize: Math.min(
      input.pageSize ?? everJobsConfig.defaultPageSize,
      EVER_JOBS_MAX_PAGE_SIZE,
    ),
    sites:
      input.sites ??
      (everJobsConfig.defaultSites.length > 0
        ? everJobsConfig.defaultSites
        : everJobsConfig.allowedSites),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = JobSearchRequestSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.errors[0]?.message ||
        "Invalid job search request payload";

      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await searchJobs(buildSafeInput(parsed.data));

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof EverJobsClientError) {
      console.error("Job search upstream error:", error.message);

      return NextResponse.json(
        { errorCode: "JOB_SEARCH_UNAVAILABLE" },
        { status: error.status === 504 ? 504 : 502 },
      );
    }

    console.error("Job search API error:", error);

    return NextResponse.json(
      { errorCode: "JOB_SEARCH_UNAVAILABLE" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await pingEverJobsServer();

    return NextResponse.json({ available: true });
  } catch (error) {
    if (error instanceof EverJobsClientError) {
      console.error("Job search ping error:", error.message);

      return NextResponse.json(
        {
          available: false,
          errorCode: "JOB_SERVER_UNAVAILABLE",
        },
        { status: error.status === 504 ? 504 : 502 },
      );
    }

    console.error("Job search ping API error:", error);

    return NextResponse.json(
      {
        available: false,
        errorCode: "JOB_SERVER_UNAVAILABLE",
      },
      { status: 500 },
    );
  }
}
