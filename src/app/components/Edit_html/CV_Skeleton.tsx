"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface CVSkeletonProps {
  progress?: number; // Optional progress value from 0 to 100
  isFirstApiDone?: boolean; // Flag for when the first API is done
  isSecondApiDone?: boolean; // Flag for when the second API is done
}

export default function CVSkeleton({ 
  progress, 
  isFirstApiDone = false, 
  isSecondApiDone = false 
}: CVSkeletonProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Use provided progress if available, otherwise calculate based on elapsed time
  const effectiveProgress = progress !== undefined ? progress : internalProgress;
  
  // Update elapsed time and internal progress every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);
      
      // Calculate progress based on time (assuming max 15 seconds for full completion)
      // Adjust the max time based on typical API response times
      const maxTimeMs = 15000; // 15 seconds maximum
      
      // If both APIs are done, set to 100%
      if (isFirstApiDone && isSecondApiDone) {
        setInternalProgress(100);
      } 
      // If one API is done, set to at least 50%
      else if (isFirstApiDone || isSecondApiDone) {
        const timeBasedProgress = Math.min(elapsed / maxTimeMs * 100, 99);
        setInternalProgress(Math.max(timeBasedProgress, 50)); // At least 50% if one API is done
      } 
      // Otherwise calculate based on elapsed time
      else {
        setInternalProgress(Math.min(elapsed / maxTimeMs * 100, 95)); // Cap at 95% until APIs finish
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [startTime, isFirstApiDone, isSecondApiDone]);
  
  // Format elapsed time as seconds
  const formattedTime = (elapsedTime / 1000).toFixed(1);
  
  const pulseAnimation = {
    opacity: [0.6, 1, 0.6],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  }

  return (
    <motion.div
      animate={pulseAnimation}
      className="border-2 border-gray-100 max-w-full h-full flex flex-col"
    >
      {/* Progress bar at the top */}
      <div className="px-6 pt-4 w-full">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <motion.div 
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${effectiveProgress}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>Generando CV...</span>
          <span>{Math.round(effectiveProgress)}% completado ({formattedTime}s)</span>
        </div>
        
        {/* API status indicators */}
        <div className="flex gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isFirstApiDone ? 'bg-green-500' : 'bg-blue-400 animate-pulse'}`}></div>
            <span className="text-xs">Procesando datos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSecondApiDone ? 'bg-green-500' : 'bg-blue-400 animate-pulse'}`}></div>
            <span className="text-xs">Generando plantilla</span>
          </div>
        </div>
      </div>

      <Card className="max-w-full flex-grow bg-white rounded-2xl shadow-xl border border-gray-100">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Header tabs */}
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-10 w-28 rounded-full bg-gray-200" />
            <Skeleton className="h-10 w-28 rounded-full bg-gray-200" />
            <Skeleton className="h-10 w-28 rounded-full bg-gray-200" />
          </div>

          {/* Download button */}
          <div className="flex justify-end mb-6">
            <Skeleton className="h-12 w-40 rounded-full bg-gray-200" />
          </div>

          {/* CV Content */}
          <div className="max-w-full mx-auto space-y-10">
            {/* Name and title */}
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="h-14 w-64 mx-auto bg-gray-200 rounded-md" />
              <Skeleton className="h-6 w-40 mx-auto bg-gray-200 rounded-md" />
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap justify-center gap-4">
              <Skeleton className="h-5 w-36 bg-gray-200 rounded-md" />
              <Skeleton className="h-5 w-28 bg-gray-200 rounded-md" />
              <Skeleton className="h-5 w-32 bg-gray-200 rounded-md" />
            </div>

            {/* Professional Summary */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-48 bg-gray-200 rounded-md" />
              <Skeleton className="h-4 max-w-full bg-gray-200 rounded-md" />
              <Skeleton className="h-4 w-5/6 bg-gray-200 rounded-md" />
              <Skeleton className="h-4 w-3/4 bg-gray-200 rounded-md" />
            </div>

            {/* Professional Experience */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-56 bg-gray-200 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-44 bg-gray-200 rounded-md" />
                <Skeleton className="h-4 w-60 bg-gray-200 rounded-md" />
              </div>
              {/* Bullet points */}
              <div className="space-y-2 pl-5">
                <Skeleton className="h-4 max-w-full bg-gray-200 rounded-md" />
                <Skeleton className="h-4 w-5/6 bg-gray-200 rounded-md" />
                <Skeleton className="h-4 w-3/4 bg-gray-200 rounded-md" />
              </div>
            </div>

            {/* Skills or Additional Section */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-48 bg-gray-200 rounded-md" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-6 w-24 bg-gray-200 rounded-full" />
                <Skeleton className="h-6 w-20 bg-gray-200 rounded-full" />
                <Skeleton className="h-6 w-28 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}