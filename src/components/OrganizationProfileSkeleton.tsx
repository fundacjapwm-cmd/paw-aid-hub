import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Heart, Bone, PawPrint } from "lucide-react";

const OrganizationProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E5] via-white to-[#FFF0F5] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white/60 backdrop-blur-md border border-white/50 shadow-bubbly rounded-[3rem] p-8 md:p-12 overflow-hidden">
            {/* Dekoracyjne ikony w tle */}
            <Heart className="absolute top-8 left-8 h-32 w-32 text-primary/5 -rotate-12" />
            <Bone className="absolute bottom-8 right-8 h-40 w-40 text-accent/5 rotate-12" />
            <PawPrint className="absolute top-1/2 right-12 h-20 w-20 text-secondary/5 -rotate-6" />

            {/* Grid Layout - 2 kolumny na desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
              {/* Lewa kolumna - Metryczka */}
              <div className="space-y-6">
                {/* Logo i nazwa */}
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <Skeleton className="h-32 w-32 rounded-3xl" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-64" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>

                {/* Metryczka */}
                <Card className="bg-gradient-to-br from-white/80 to-white/60 border-white/50 shadow-md">
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-48 mb-4" />
                    
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Prawa kolumna - Wishlistę organizacji */}
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>

                {/* Progress Bar Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                
                <Card className="bg-white/80 border-white/50 shadow-md">
                  <div className="p-6 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex gap-3 p-3 bg-white/60 rounded-xl border border-white/50">
                        <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="flex flex-col justify-end shrink-0">
                          <Skeleton className="h-9 w-24 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animals Section Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden rounded-3xl">
                <Skeleton className="w-full aspect-square" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfileSkeleton;
