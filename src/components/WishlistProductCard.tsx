import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Plus, Minus, X, Check } from "lucide-react";
import { useState } from "react";

interface WishlistProductCardProps {
  product: {
    id: string;
    product_id?: string;
    name: string;
    price: number;
    image_url?: string;
    quantity?: number;
    bought?: boolean;
  };
  quantity: number;
  maxQuantity?: number;
  isInCart?: boolean;
  cartQuantity?: number;
  onQuantityChange: (productId: string, change: number) => void;
  onAddToCart: (product: any) => void;
  onRemoveFromCart?: (productId: string) => void;
  showSmartFill?: boolean;
  onSmartFill?: (productId: string, quantity: number) => void;
}

export const WishlistProductCard = ({
  product,
  quantity,
  maxQuantity,
  isInCart = false,
  cartQuantity = 0,
  onQuantityChange,
  onAddToCart,
  onRemoveFromCart,
  showSmartFill = false,
  onSmartFill,
}: WishlistProductCardProps) => {
  const productId = product.product_id || product.id;
  const neededQuantity = maxQuantity || product.quantity || 1;
  
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-3 p-4 md:p-3 bg-white rounded-3xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md md:hover:shadow-sm hover:border-primary/20 hover:bg-orange-50/30 md:hover:bg-transparent transition-all duration-300">
      {/* Top Row Mobile: Image + Price */}
      <div className="flex md:hidden items-start justify-between gap-3">
        {/* Image */}
        <div className="shrink-0 relative">
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
        
        {/* Price - Right Top Corner on Mobile */}
        <div className="text-right">
          <div className={`font-black text-lg ${product.bought ? 'text-muted-foreground' : 'text-primary'}`}>
            {Number(product.price).toFixed(2)} zł
          </div>
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

      {/* Desktop: Image (Left) */}
      <div className="hidden md:block shrink-0 relative">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-20 h-20 rounded-xl object-cover bg-gray-50"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content: Name + Price (desktop only) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Product Name */}
        <h4 
          className={`font-bold text-base md:text-sm md:font-semibold leading-tight line-clamp-2 mb-2 md:mb-1 ${
            product.bought ? 'text-muted-foreground line-through' : 'text-gray-800 md:text-foreground'
          }`}
          title={product.name}
        >
          {product.name}
        </h4>
        
        {/* Desktop: Price + Smart Fill */}
        <div className="hidden md:block">
          <div className={`font-bold text-base ${product.bought ? 'text-muted-foreground' : 'text-primary'}`}>
            {Number(product.price).toFixed(2)} zł
          </div>
          {showSmartFill && !product.bought && neededQuantity > 1 && onSmartFill && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSmartFill(productId, neededQuantity)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors text-left underline decoration-dotted"
                >
                  Brakuje: {neededQuantity} szt
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Kliknij, aby ustawić {neededQuantity} szt</p>
              </TooltipContent>
            </Tooltip>
          )}
          {product.bought && (
            <Badge variant="secondary" className="text-xs w-fit mt-1">✓ Kupione</Badge>
          )}
        </div>
      </div>

      {/* Bottom Row Mobile / Right Column Desktop: Actions */}
      {!product.bought && (
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-3 shrink-0 md:pl-2">
          {/* Counter Pill */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-full md:rounded-lg px-1 py-1 md:h-9 md:p-1 border border-gray-100 md:border-0 shadow-inner">
            <button 
              className="w-7 h-7 md:w-6 md:h-full bg-white md:bg-transparent rounded-full md:rounded-md shadow-sm md:shadow-none flex items-center justify-center text-gray-600 md:text-gray-500 hover:text-primary hover:scale-110 md:hover:scale-100 md:hover:bg-white transition-all disabled:opacity-30"
              onClick={() => onQuantityChange(productId, -1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5 md:h-3 md:w-3" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-primary md:text-foreground tabular-nums">
              {quantity}
            </span>
            <button 
              className="w-7 h-7 md:w-6 md:h-full bg-white md:bg-transparent rounded-full md:rounded-md shadow-sm md:shadow-none flex items-center justify-center text-gray-600 md:text-gray-500 hover:text-primary hover:scale-110 md:hover:scale-100 md:hover:bg-white transition-all disabled:opacity-30"
              onClick={() => onQuantityChange(productId, 1)}
              disabled={maxQuantity ? quantity >= maxQuantity : false}
            >
              <Plus className="h-3.5 w-3.5 md:h-3 md:w-3" />
            </button>
          </div>

          {/* Action Buttons Container */}
          <div className="flex items-center gap-2">
            {/* Remove Button (if in cart) */}
            {isInCart && onRemoveFromCart && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="h-10 w-10 md:h-9 md:w-9 rounded-full md:rounded-xl bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all shadow-bubbly md:shadow-none hover:scale-105"
                    onClick={() => onRemoveFromCart(productId)}
                  >
                    <X className="h-5 w-5 md:h-4 md:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Usuń z koszyka</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Add to Cart Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button 
                    size="icon" 
                    className={`h-10 w-10 md:h-9 md:w-9 rounded-full md:rounded-xl shadow-bubbly md:shadow-sm hover:scale-105 transition-all ${
                      isInCart 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                    onClick={() => onAddToCart(product)}
                    disabled={isInCart}
                  >
                    {isInCart ? (
                      <Check className="h-5 w-5 md:h-4 md:w-4" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 md:h-4 md:w-4" />
                    )}
                  </Button>
                  {cartQuantity > 0 && (
                    <Badge 
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background"
                    >
                      {cartQuantity}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {isInCart ? `${cartQuantity} szt. w koszyku` : 'Dodaj do koszyka'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};
