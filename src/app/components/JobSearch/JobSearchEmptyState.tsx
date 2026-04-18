"use client";

import { SearchX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type JobSearchEmptyStateProps = {
  title: string;
  description: string;
};

export default function JobSearchEmptyState({
  title,
  description,
}: JobSearchEmptyStateProps) {
  return (
    <Card className="border-dashed border-slate-300 bg-white/80 shadow-sm">
      <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <SearchX className="h-6 w-6 text-slate-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="max-w-xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
