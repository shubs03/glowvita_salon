import React from "react";
import { Skeleton } from "@repo/ui/skeleton";

export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <Skeleton className="h-7 sm:h-8 w-48 sm:w-64 mb-2" />
              <Skeleton className="h-4 sm:h-5 w-64 sm:w-80" />
            </div>
          </div>
        </div>

        {/* Profile Header Card Skeleton */}
        <div className="rounded-lg border border-muted/50 shadow-sm overflow-hidden">
          <div className="bg-muted/30 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full" />
              <div className="flex-grow space-y-2 sm:space-y-3 w-full sm:w-auto">
                <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
                <Skeleton className="h-4 sm:h-5 w-40 sm:w-48" />
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <Skeleton className="h-9 sm:h-10 w-20 sm:w-24" />
                  <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
                  <Skeleton className="h-9 sm:h-10 w-20 sm:w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation Skeleton */}
        <div className="relative w-full mb-4 sm:mb-6">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide smooth-scroll">
            <div className="inline-flex h-auto items-center gap-1.5 sm:gap-2 rounded-xl bg-muted/50 p-1 sm:p-1.5 backdrop-blur-sm border border-border/50 shadow-sm w-auto min-w-full">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 sm:h-11 w-20 sm:w-28 md:w-32 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="rounded-lg border border-muted/50 shadow-sm overflow-hidden bg-card">
          <div className="p-4 sm:p-6">
            <div className="space-y-2 mb-4 sm:mb-6">
              <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
              <Skeleton className="h-4 w-64 sm:w-80" />
            </div>
            
            {/* Form Fields Skeleton */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 sm:w-32" />
                  <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 sm:w-24" />
                  <Skeleton className="h-20 sm:h-24 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 sm:w-36" />
                  <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 sm:w-32" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-20 sm:w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6">
              <Skeleton className="h-10 sm:h-12 w-24 sm:w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};