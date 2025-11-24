import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AnimalCardSkeleton = () => {
  return (
    <Card className="overflow-hidden bg-card rounded-3xl border-0 shadow-card hover:shadow-bubbly transition-all duration-300 animate-in fade-in">
      <div className="relative">
        {/* Image Skeleton */}
        <Skeleton className="w-full h-64 rounded-t-3xl" />
        
        {/* Badge Skeleton */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        {/* Wishlist Progress Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent">
          <Skeleton className="h-2 w-full rounded-full mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Name and Age */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Wishlist Items */}
        <div className="space-y-3 pt-4 border-t">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-10 flex-1 rounded-2xl" />
          <Skeleton className="h-10 flex-1 rounded-2xl" />
        </div>
      </div>
    </Card>
  );
};

export default AnimalCardSkeleton;
