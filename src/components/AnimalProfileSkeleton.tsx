import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AnimalProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-6"
          disabled
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć do listy zwierząt
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Main Card with Name, Image, Details */}
            <Card className="p-8 rounded-3xl">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 space-y-3">
                  <Skeleton className="w-64 h-64 rounded-3xl" />
                  
                  {/* Gallery thumbnails */}
                  <div className="grid grid-cols-3 gap-2 w-64">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <Skeleton className="h-10 w-48 mb-4" />
                    <Skeleton className="h-6 w-32" />
                  </div>

                  {/* Metryczka */}
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-32 mb-3" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-4 w-32" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* O mnie */}
                  <div>
                    <Skeleton className="h-6 w-24 mb-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Wishlist Card Skeleton */}
            <Card className="p-0 flex flex-col h-[600px] rounded-3xl overflow-hidden shadow-lg">
              {/* Header with Progress */}
              <div className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Body - Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className="flex gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex flex-col justify-end shrink-0">
                      <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-muted/10 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-11 w-full rounded-2xl" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnimalProfileSkeleton;
