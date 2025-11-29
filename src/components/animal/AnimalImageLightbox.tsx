import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface AnimalImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Array<{ id: string; image_url: string }>;
  currentIndex: number;
  animalName: string;
  onPrev: () => void;
  onNext: () => void;
}

export function AnimalImageLightbox({
  open,
  onOpenChange,
  images,
  currentIndex,
  animalName,
  onPrev,
  onNext,
}: AnimalImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
        <div className="relative flex items-center justify-center min-h-[60vh]">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 z-10 text-white hover:bg-white/20 h-12 w-12"
              onClick={onPrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Image */}
          <img
            src={images[currentIndex]?.image_url}
            alt={`${animalName} - zdjęcie ${currentIndex + 1}`}
            className="max-h-[80vh] max-w-full object-contain"
          />

          {/* Next button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 z-10 text-white hover:bg-white/20 h-12 w-12"
              onClick={onNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
