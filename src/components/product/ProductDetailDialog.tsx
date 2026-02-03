import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, ImageOff } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    price: number;
    net_price?: number;
    image_url?: string;
    description?: string;
  } | null;
  animalId?: string;
  animalName?: string;
  maxQuantity?: number;
}

export const ProductDetailDialog = ({
  open,
  onOpenChange,
  product,
  animalId,
  animalName,
  maxQuantity,
}: ProductDetailDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();

  if (!product) return null;

  const handleQuantityChange = (newQuantity: number) => {
    const max = maxQuantity || 99;
    const clamped = Math.max(1, Math.min(newQuantity, max));
    setQuantity(clamped);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      netPrice: product.net_price,
      animalId,
      animalName,
      maxQuantity,
    }, quantity, false); // Let CartContext handle the toast
    onOpenChange(false);
    setQuantity(1);
  };

  // Format description for better readability - split on common patterns
  const formatDescription = (description: string) => {
    return description
      .replace(/KOMPLETNA KARMA/g, '\n\n**KOMPLETNA KARMA**')
      .replace(/SKŁAD:|Skład:/g, '\n\n**SKŁAD:**')
      .replace(/SKŁADNIKI ANALITYCZNE:|Składniki analityczne:/g, '\n\n**SKŁADNIKI ANALITYCZNE:**')
      .replace(/DODATKI ŻYWIENIOWE|Dodatki żywieniowe|Dodatki odżywcze/g, '\n\n**DODATKI ŻYWIENIOWE:**')
      .replace(/WARTOŚĆ ENERGETYCZNA:|Wartość energetyczna:/g, '\n\n**WARTOŚĆ ENERGETYCZNA:**')
      .replace(/Zalecane dzienne porcje|Zalecenia:/g, '\n\n**ZALECENIA:**')
      .replace(/Co znajdziesz w miseczce\?/g, '\n\n**Co znajdziesz w miseczce?**')
      .replace(/Co wyróżnia/g, '\n\n**Co wyróżnia**')
      .replace(/Najważniejsze zalety/g, '\n\n**Najważniejsze zalety:**');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setQuantity(1);
        setImageError(false);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold leading-tight pr-6">
            {product.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Szczegóły produktu {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-4 pt-2 space-y-4">
            {/* Product Image */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden bg-muted border border-border shadow-sm">
              {product.image_url && typeof product.image_url === 'string' && product.image_url.trim() !== '' && !imageError ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                  onError={() => setImageError(true)}
                  onLoad={(e) => {
                    // Ensure image actually loaded with content
                    const img = e.target as HTMLImageElement;
                    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                      setImageError(true);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ImageOff className="h-16 w-16 mb-2" />
                  <span className="text-sm">Brak zdjęcia</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description ? (
              <div className="prose prose-sm max-w-none">
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {formatDescription(product.description).split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('**')) {
                      const headerMatch = paragraph.match(/^\*\*([^*]+)\*\*/);
                      if (headerMatch) {
                        const header = headerMatch[1];
                        const content = paragraph.replace(/^\*\*[^*]+\*\*/, '').trim();
                        return (
                          <div key={idx} className="mt-3">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">
                              {header}
                            </h4>
                            {content && <p className="text-sm">{content}</p>}
                          </div>
                        );
                      }
                    }
                    return paragraph.trim() ? (
                      <p key={idx} className="mt-2">{paragraph}</p>
                    ) : null;
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center italic">
                Brak opisu produktu
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Quantity and Add to Cart - Fixed at bottom */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-none"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={maxQuantity || 99}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-14 h-10 text-center border-0 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={maxQuantity ? quantity >= maxQuantity : false}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart} 
              className="flex-1 h-10 gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Dodaj do koszyka ({(product.price * quantity).toFixed(2)} zł)
            </Button>
          </div>
          {maxQuantity && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Maksymalna ilość: {maxQuantity}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
