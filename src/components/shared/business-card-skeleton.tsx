'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function BusinessCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <div className="flex bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        <Skeleton className="w-40 sm:w-52 flex-shrink-0 rounded-none" />
        <div className="flex-1 p-4 sm:p-5 space-y-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }

  // Grid skeleton — carte 4:3 avec logo chevauchant
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
      {/* Image skeleton — 4:3 */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      {/* Contenu skeleton */}
      <div className="p-4">
        <Skeleton className="h-12 w-12 rounded-xl -mt-9 mb-3 ring-2 ring-white relative bg-background" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-1.5" />
        <Skeleton className="h-3 w-2/3 mb-3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        {/* Espace CTA */}
        <Skeleton className="h-8 w-full rounded-xl mt-3 hidden sm:block" />
      </div>
    </div>
  );
}
