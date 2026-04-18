import type { Metadata } from "next";

import JobSearchSection from "@/app/components/JobSearch/JobSearchSection";
import { everJobsConfig } from "@/lib/ever-jobs/config";

export const metadata: Metadata = {
  title: "Buscar trabajo | TailorCV",
  description:
    "Explora vacantes relevantes desde TailorCV con filtros seguros, experiencia rápida y enlaces directos a cada oferta original.",
};

export default function JobSearchPage() {
  const initialSites =
    everJobsConfig.defaultSites.length > 0
      ? [...everJobsConfig.defaultSites]
      : [...everJobsConfig.allowedSites];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-6">
      <div className="container mx-auto px-4">
        <JobSearchSection
          initialPageSize={everJobsConfig.defaultPageSize}
          initialSites={initialSites}
          allowedSites={everJobsConfig.allowedSites}
        />
      </div>
    </div>
  );
}
