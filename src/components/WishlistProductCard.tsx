import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Plus, Minus, X, Check, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ProductDetailDialog } from "@/components/product/ProductDetailDialog";

interface WishlistProductCardProps {
  product: {
    id: string;
    product_id?: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    quantity?: number;
    purchasedQuantity?: number;
    bought?: boolean;
  };
  quantity: number;
  maxQuantity?: number;
  isInCart?: boolean;
  cartQuantity?: number;
  onQuantityChange: (productId: string, change: number) => void;
  onSetQuantity?: (productId: string, quantity: number) => void;
  onAddToCart: (product: any) => void;
  onRemoveFromCart?: (productId: string) => void;
  showSmartFill?: boolean;
  onSmartFill?: (productId: string, quantity: number) => void;
  unlimitedQuantity?: boolean;
}

export const WishlistProductCard = ({
  product,
  quantity,
  maxQuantity,
  isInCart = false,
  cartQuantity = 0,
  onQuantityChange,
  onSetQuantity,
  onAddToCart,
  onRemoveFromCart,
  showSmartFill = false,
  onSmartFill,
  unlimitedQuantity = false,
}: WishlistProductCardProps) => {
  const productId = product.product_id || product.id;
  const neededQuantity = maxQuantity || product.quantity || 1;
  const purchasedQty = product.purchasedQuantity || 0;
  const totalNeeded = product.quantity || 1;
  const hasPartialProgress = purchasedQty > 0 && !product.bought;
  const [inputValue, setInputValue] = useState(String(quantity));
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Sync input value when quantity prop changes
  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input while typing
    if (value === '') {
      setInputValue('');
      return;
    }
    // Only allow numbers
    if (!/^\d+$/.test(value)) return;
    setInputValue(value);
  };

  const handleInputBlur = () => {
    let newQty = parseInt(inputValue) || 1;
    // Ensure minimum is 1
    if (newQty < 1) newQty = 1;
    // Cap at maxQuantity unless unlimited
    if (!unlimitedQuantity && maxQuantity && newQty > maxQuantity) {
      newQty = maxQuantity;
    }
    setInputValue(String(newQty));
    // Use onSetQuantity if available, otherwise calculate the change
    if (onSetQuantity) {
      onSetQuantity(productId, newQty);
    } else {
      const change = newQty - quantity;
      if (change !== 0) {
        onQuantityChange(productId, change);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };
  
  return (
    <>
      {/* MOBILE VIEW: Soft Pop Design */}
      <div className="flex md:hidden flex-col gap-4 p-4 bg-card rounded-3xl border border-border/50 shadow-card transition-all duration-300">
        {/* Top Row: Image + Price */}
        <div className="flex items-start justify-between gap-3">
          {/* Image */}
          <div className="shrink-0">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-inner bg-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Price - Right Top Corner */}
          <div className="text-right">
            <div className={`font-black text-lg ${product.bought ? 'text-muted-foreground' : 'text-primary-dark'}`}>
              {Number(product.price).toFixed(2)} zł
            </div>
            {/* Progress indicator for partial purchases */}
            {hasPartialProgress && (
              <div className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                {purchasedQty}/{totalNeeded} kupione
              </div>
            )}
            {showSmartFill && !product.bought && neededQuantity > 1 && onSmartFill && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSmartFill(productId, neededQuantity)}
                    className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md inline-block mt-1 hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    Brakuje: {neededQuantity}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Kliknij, aby ustawić {neededQuantity} szt</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Product Name - clickable to open details */}
        <button
          onClick={() => setShowDetailDialog(true)}
          className="text-left w-full"
          aria-label="Zobacz szczegóły produktu"
        >
          <h4 
            className={`font-bold text-base leading-tight line-clamp-2 hover:text-primary transition-colors ${
              product.bought ? 'text-muted-foreground line-through' : 'text-gray-800'
            }`}
            title={product.name}
          >
            {product.name}
          </h4>
        </button>

        {/* Bottom Row: Counter + Action Buttons */}
        {!product.bought && (
          <div className="flex items-center justify-between gap-3">
            {/* Counter Pill */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-full px-1 py-1 border border-gray-100 shadow-inner">
              <button 
                className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 transition-all disabled:opacity-30"
                onClick={() => onQuantityChange(productId, -1)}
                disabled={quantity <= 1}
                aria-label="Zmniejsz ilość"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="w-10 text-center font-bold text-sm text-primary-dark tabular-nums bg-transparent border-none outline-none focus:ring-0"
                aria-label={`Ilość produktu ${product.name}`}
              />
              <button 
                className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 transition-all disabled:opacity-30"
                onClick={() => onQuantityChange(productId, 1)}
                disabled={!unlimitedQuantity && maxQuantity ? quantity >= maxQuantity : false}
                aria-label="Zwiększ ilość"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Action Button - Arrow when not in cart, X when in cart */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  {isInCart && onRemoveFromCart ? (
                    <Button 
                      size="icon" 
                      className="h-10 w-10 rounded-full bg-destructive hover:bg-destructive/90 shadow-bubbly transition-all"
                      onClick={() => onRemoveFromCart(productId)}
                      aria-label={`Usuń ${product.name} z koszyka`}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button 
                      size="icon" 
                      className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-bubbly transition-all"
                      onClick={() => onAddToCart(product)}
                      aria-label={`Dodaj ${product.name} do koszyka`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  )}
                  {cartQuantity > 0 && (
                    <Badge 
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500 text-white border-2 border-background"
                    >
                      {cartQuantity}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {isInCart ? 'Usuń z koszyka' : 'Dodaj do koszyka'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Bought Badge for Mobile */}
        {product.bought && (
          <Badge variant="secondary" className="text-xs w-fit">✓ Kupione</Badge>
        )}
      </div>

      {/* DESKTOP VIEW: Compact Design (Previous Style) */}
      <div className={`hidden md:flex gap-3 p-3 rounded-xl transition-all ${
        product.bought 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-card border border-border/50 shadow-card md:hover:border-primary/30 md:hover:shadow-bubbly'
      }`}>
        {/* Image */}
        <div className="shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <button
              onClick={() => setShowDetailDialog(true)}
              className="text-left w-full"
              aria-label="Zobacz szczegóły produktu"
            >
              <p className={`text-sm font-bold leading-tight line-clamp-2 mb-1 hover:text-primary transition-colors ${
                product.bought ? 'text-green-700 line-through' : 'text-foreground'
              }`} title={product.name}>
                {product.name}
              </p>
            </button>
            {/* Progress indicator for partial purchases */}
            {hasPartialProgress && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {purchasedQty}/{totalNeeded} kupione
              </span>
            )}
            {!product.bought && showSmartFill && neededQuantity > 1 && onSmartFill && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSmartFill(productId, neededQuantity)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors text-left underline decoration-dotted"
                  >
                    Potrzeba: {neededQuantity} szt
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Kliknij, aby ustawić {neededQuantity} szt</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className={`text-base font-bold ${
            product.bought ? 'text-green-600' : 'text-primary-dark'
          }`}>
            {Number(product.price).toFixed(2)} zł
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-end items-end shrink-0 pl-2 min-w-[140px]">
          {product.bought ? (
            <span className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-semibold">
              ✓ Kupione
            </span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Counter */}
              <div className="flex items-center bg-gray-50 rounded-lg h-9 p-1 shadow-inner">
                <button 
                  className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30 text-base font-bold"
                  onClick={() => onQuantityChange(productId, -1)}
                  disabled={quantity <= 1}
                  aria-label="Zmniejsz ilość"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className="w-10 text-center text-sm font-bold tabular-nums bg-transparent border-none outline-none focus:ring-0"
                  aria-label={`Ilość produktu ${product.name}`}
                />
                <button 
                  className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30 text-base font-bold"
                  onClick={() => onQuantityChange(productId, 1)}
                  disabled={!unlimitedQuantity && maxQuantity ? quantity >= maxQuantity : false}
                  aria-label="Zwiększ ilość"
                >
                  +
                </button>
              </div>

              {/* Action Button - Arrow when not in cart, X when in cart */}
              <div className="relative shrink-0">
                {isInCart && onRemoveFromCart ? (
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl bg-destructive hover:bg-destructive/90 text-white transition-all"
                    onClick={() => onRemoveFromCart(productId)}
                    aria-label={`Usuń ${product.name} z koszyka`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-bubbly hover:scale-105 transition-all"
                    onClick={() => onAddToCart(product)}
                    aria-label={`Dodaj ${product.name} do koszyka`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                )}
                {cartQuantity > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500 text-white border-2 border-background rounded-full"
                  >
                    {cartQuantity}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        product={product}
      />
    </>
  );
};
