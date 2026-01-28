import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    name: string;
    price: number;
    image_url?: string;
    description?: string;
  } | null;
}

export const ProductDetailDialog = ({
  open,
  onOpenChange,
  product,
}: ProductDetailDialogProps) => {
  if (!product) return null;

  // Format description for better readability - split on common patterns
  const formatDescription = (description: string) => {
    // Split on common section headers
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold leading-tight pr-6">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-4 pt-2 space-y-4">
            {/* Product Image */}
            {product.image_url && (
              <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden bg-white border border-border shadow-sm">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Price Badge */}
            <div className="flex justify-center">
              <Badge className="text-lg px-4 py-1.5 bg-primary text-white font-bold">
                {Number(product.price).toFixed(2)} zł
              </Badge>
            </div>

            {/* Description */}
            {product.description ? (
              <div className="prose prose-sm max-w-none">
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {formatDescription(product.description).split('\n\n').map((paragraph, idx) => {
                    // Check if paragraph starts with **
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
      </DialogContent>
    </Dialog>
  );
};
