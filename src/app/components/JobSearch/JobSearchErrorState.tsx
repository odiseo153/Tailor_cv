"use client";

import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type JobSearchErrorStateProps = {
  title: string;
  description: string;
};

export default function JobSearchErrorState({
  title,
  description,
}: JobSearchErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50 shadow-sm">
      <CardContent className="flex flex-col gap-3 px-6 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-950">{title}</h3>
          <p className="text-sm leading-6 text-red-800">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
