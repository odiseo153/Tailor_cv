"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function CVSkeleton() {
  return (
    <Card className="w-full h-full bg-white">
      <CardContent className="p-6">
        {/* Header tabs */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-8 w-24 rounded-full bg-gray-200" />
          <Skeleton className="h-8 w-24 rounded-full bg-gray-200" />
        </div>

        {/* Download button */}
        <div className="flex justify-end mb-6">
          <Skeleton className="h-10 w-36 rounded-full bg-gray-200" />
        </div>

        {/* Code editor area */}
        <Skeleton className="h-8 w-20 mb-2 bg-gray-200" />

        {/* CV Content */}
        <div className="space-y-8 mt-6">
          {/* Name and title */}
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-12 w-48 bg-gray-200" />
            <Skeleton className="h-6 w-36 bg-gray-200" />
          </div>

          {/* Contact info */}
          <div className="flex justify-center gap-4 mt-4">
            <Skeleton className="h-4 w-40 bg-gray-200" />
            <Skeleton className="h-4 w-32 bg-gray-200" />
            <Skeleton className="h-4 w-24 bg-gray-200" />
          </div>

          {/* Professional Summary */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-3/4 bg-gray-200" />
          </div>

          {/* Professional Experience */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 bg-gray-200" />
            <Skeleton className="h-6 w-48 bg-gray-200" />
            <Skeleton className="h-4 w-64 bg-gray-200" />

            {/* Bullet points */}
            <div className="space-y-2 pl-5">
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-3/4 bg-gray-200" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

