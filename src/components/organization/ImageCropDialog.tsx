import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CroppedArea
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to match the crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
}

export default function ImageCropDialog({
  open,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback(
    (croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropComplete = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Przytnij i dopasuj logo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cropper Area */}
          <div className="relative h-[400px] bg-muted rounded-2xl overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropAreaChange}
              objectFit="contain"
              showGrid={false}
              cropShape="round"
              style={{
                containerStyle: {
                  backgroundColor: "hsl(var(--muted))",
                },
                cropAreaStyle: {
                  border: "3px solid hsl(var(--primary))",
                },
              }}
            />
          </div>

          {/* Zoom Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                Przybliżenie
              </span>
              <span className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
              </span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Wskazówki:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Przeciągnij obraz, aby go wycentrować</li>
              <li>Użyj suwaka, aby przybliżyć lub oddalić</li>
              <li>Logo będzie obcięte do kształtu koła</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Anuluj
          </Button>
          <Button onClick={handleCropComplete} disabled={isProcessing}>
            {isProcessing ? "Przetwarzanie..." : "Zapisz logo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
