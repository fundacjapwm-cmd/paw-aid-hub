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
    <>
      {/* MOBILE VIEW: Soft Pop Design */}
      <div className="flex md:hidden flex-col gap-4 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-orange-50/30 transition-all duration-300">
        {/* Top Row: Image + Price */}
        <div className="flex items-start justify-between gap-3">
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
          
          {/* Price - Right Top Corner */}
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

        {/* Product Name */}
        <h4 
          className={`font-bold text-base leading-tight line-clamp-2 ${
            product.bought ? 'text-muted-foreground line-through' : 'text-gray-800'
          }`}
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Bottom Row: Counter + Action Buttons */}
        {!product.bought && (
          <div className="flex items-center justify-between gap-3">
            {/* Counter Pill */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-1 py-1 border border-gray-100 shadow-inner">
              <button 
                className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all disabled:opacity-30"
                onClick={() => onQuantityChange(productId, -1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-sm text-primary tabular-nums">
                {quantity}
              </span>
              <button 
                className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all disabled:opacity-30"
                onClick={() => onQuantityChange(productId, 1)}
                disabled={maxQuantity ? quantity >= maxQuantity : false}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Remove Button */}
              {isInCart && onRemoveFromCart && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all shadow-bubbly hover:scale-105"
                      onClick={() => onRemoveFromCart(productId)}
                    >
                      <X className="h-5 w-5" />
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
                      className={`h-10 w-10 rounded-full shadow-bubbly hover:scale-105 transition-all ${
                        isInCart 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      onClick={() => onAddToCart(product)}
                      disabled={isInCart}
                    >
                      {isInCart ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <ShoppingCart className="h-5 w-5" />
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

        {/* Bought Badge for Mobile */}
        {product.bought && (
          <Badge variant="secondary" className="text-xs w-fit">✓ Kupione</Badge>
        )}
      </div>

      {/* DESKTOP VIEW: Compact Design (Previous Style) */}
      <div className={`hidden md:flex gap-3 p-3 rounded-xl transition-all ${
        product.bought 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-white border border-gray-100 shadow-sm hover:border-primary/20'
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
            <p className={`text-sm font-bold leading-tight line-clamp-2 mb-1 ${
              product.bought ? 'text-green-700 line-through' : 'text-foreground'
            }`} title={product.name}>
              {product.name}
            </p>
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
            product.bought ? 'text-green-600' : 'text-primary'
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
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold tabular-nums">
                  {quantity}
                </span>
                <button 
                  className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-white rounded-md transition-all disabled:opacity-30 text-base font-bold"
                  onClick={() => onQuantityChange(productId, 1)}
                  disabled={maxQuantity ? quantity >= maxQuantity : false}
                >
                  +
                </button>
              </div>

              {/* Remove Button */}
              {isInCart && onRemoveFromCart && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0"
                  onClick={() => onRemoveFromCart(productId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Add to Cart Button */}
              <div className="relative shrink-0">
                <Button
                  size="icon"
                  className={`h-9 w-9 rounded-xl transition-all ${
                    isInCart 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-primary hover:bg-primary/90 text-white shadow-bubbly hover:scale-105'
                  }`}
                  onClick={() => onAddToCart(product)}
                  disabled={isInCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                {cartQuantity > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background rounded-full"
                  >
                    {cartQuantity}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
