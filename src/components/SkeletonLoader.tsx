import { Skeleton } from '@/components/ui/skeleton';

export const EventCardSkeleton = () => (
  <div className="p-4 rounded-lg border border-border/50 space-y-3 animate-pulse">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-6 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

export const EventDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="border-b bg-card/95 backdrop-blur-md">
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-card via-card to-primary/5 border-b">
      <div className="container max-w-6xl mx-auto px-4 py-4 space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>

    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg p-6 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const CategoryListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="border rounded-lg p-6 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    ))}
  </div>
);
