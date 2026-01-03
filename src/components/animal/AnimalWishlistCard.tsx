import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import WishlistProgressBar from "@/components/WishlistProgressBar";
import { WishlistProductCard } from "@/components/WishlistProductCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AnimalWishlistCardProps {
  animal: any;
  quantities: Record<string, number>;
  cartTotalForAnimal: number;
  totalWishlistCost: number;
  allItemsInCart: boolean;
  onQuantityChange: (productId: string, change: number) => void;
  onSetQuantity: (productId: string, qty: number) => void;
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (productId: string) => void;
  onAddAllToCart: () => void;
  onRemoveAllFromCart: () => void;
  isInCart: (productId: string) => boolean;
  getCartQuantity: (productId: string) => number;
}

export function AnimalWishlistCard({
  animal,
  quantities,
  cartTotalForAnimal,
  totalWishlistCost,
  allItemsInCart,
  onQuantityChange,
  onSetQuantity,
  onAddToCart,
  onRemoveFromCart,
  onAddAllToCart,
  onRemoveAllFromCart,
  isInCart,
  getCartQuantity,
}: AnimalWishlistCardProps) {
  return (
    <Card className="p-0 flex flex-col h-[600px] rounded-3xl overflow-hidden shadow-lg">
      {/* Header with Progress */}
      <div className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary fill-primary" />
          Potrzeby {animal.name}
        </h2>
        <WishlistProgressBar wishlist={animal.wishlist} />
      </div>

      {/* Body - Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(!animal.wishlist || animal.wishlist.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              Lista potrzeb w trakcie tworzenia...
            </p>
          </div>
        ) : (
        <TooltipProvider>
          {animal.wishlist.map((item: any) => {
            const itemInCart = isInCart(item.product_id);
            const cartQuantity = getCartQuantity(item.product_id);
            const quantity = quantities[item.product_id] || 1;
            const neededQuantity = item.quantity || 1;
            
            return (
              <WishlistProductCard
                key={item.id}
                product={{
                  id: item.id,
                  product_id: item.product_id,
                  name: item.name,
                  price: item.price,
                  image_url: item.image_url,
                  quantity: neededQuantity,
                  bought: item.bought,
                }}
                quantity={quantity}
                maxQuantity={neededQuantity}
                isInCart={itemInCart}
                cartQuantity={cartQuantity}
                onQuantityChange={(productId, change) => onQuantityChange(productId, change)}
                onSetQuantity={(productId, qty) => onSetQuantity(productId, qty)}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
                showSmartFill={!item.bought}
                onSmartFill={(productId, qty) => onSetQuantity(productId, qty)}
              />
            );
          })}
        </TooltipProvider>
        )}
      </div>

      {/* Footer - Sticky Summary */}
      {animal.wishlist.some((item: any) => !item.bought) && (
        <div className="bg-gradient-to-t from-primary/5 to-background p-5 border-t shadow-lg space-y-3">
          {cartTotalForAnimal > 0 && (
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">
                Łącznie w koszyku:
              </span>
              <span className="text-lg font-bold text-foreground">
                {cartTotalForAnimal.toFixed(2)} zł
              </span>
            </div>
          )}
          
          <Button 
            size="default"
            onClick={onAddAllToCart}
            disabled={!animal.wishlist.some((item: any) => !item.bought) || allItemsInCart}
            className={`w-full rounded-3xl md:rounded-xl font-semibold text-sm h-11 shadow-md md:hover:shadow-lg md:hover:scale-[1.02] transition-all duration-200 ${
              allItemsInCart ? 'bg-green-500 md:hover:bg-green-600' : ''
            }`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {allItemsInCart 
              ? `Dodano (${totalWishlistCost.toFixed(2)} zł)` 
              : `Dodaj wszystko! (${totalWishlistCost.toFixed(2)} zł)`
            }
          </Button>
          
          {cartTotalForAnimal > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full rounded-3xl md:rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń wszystko z koszyka
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Wszystkie produkty dla {animal.name} zostaną usunięte z koszyka.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={onRemoveAllFromCart} className="bg-destructive hover:bg-destructive/90">
                    Usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </Card>
  );
}
