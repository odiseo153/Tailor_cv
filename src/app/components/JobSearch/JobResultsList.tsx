"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JobSearchPagination, TailorCVJob } from "@/lib/ever-jobs/types";
import JobResultCard from "./JobResultCard";

type JobResultsListProps = {
  jobs: TailorCVJob[];
  pagination: JobSearchPagination;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  t: (key: string) => string;
};

export default function JobResultsList({
  jobs,
  pagination,
  isLoadingMore,
  onLoadMore,
  t,
}: JobResultsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">
            {t("job_search.results.summary").replace(
              "{count}",
              String(pagination.count),
            )}
          </p>
          <p className="text-sm text-slate-500">
            {t("job_search.results.page_summary")
              .replace("{currentPage}", String(pagination.currentPage))
              .replace(
                "{totalPages}",
                pagination.totalPages ? String(pagination.totalPages) : "-",
              )}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <JobResultCard key={`${job.id}-${job.jobUrl}`} job={job} />
        ))}
      </div>

      {pagination.nextPage ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("job_search.results.loading_more")}
              </>
            ) : (
              t("job_search.results.load_more")
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
