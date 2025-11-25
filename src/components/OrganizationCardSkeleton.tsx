import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OrganizationCardSkeleton = () => {
  return (
    <Card className="overflow-hidden bg-card rounded-3xl border-0 shadow-card animate-in fade-in">
      {/* Header with Background Image Skeleton */}
      <div className="relative h-48 bg-muted">
        <Skeleton className="w-full h-full rounded-t-3xl" />
        
        {/* Logo and Title Overlay Skeleton */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <Skeleton className="h-7 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4">
        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-2xl p-3 md:p-4 text-center space-y-2">
            <Skeleton className="h-5 w-5 mx-auto" />
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
          <div className="bg-muted/30 rounded-2xl p-3 md:p-4 text-center space-y-2">
            <Skeleton className="h-5 w-5 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </div>

        {/* Contact Info Skeleton */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrganizationCardSkeleton;
