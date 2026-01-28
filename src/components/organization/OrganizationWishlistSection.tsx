import { ShoppingCart, Trash2, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
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

interface OrganizationWishlistSectionProps {
  orgWishlist: any[];
  organizationName: string;
  selectedQuantities: Record<string, number>;
  cartTotalForOrg: number;
  onQuantityChange: (productId: string, change: number) => void;
  onSetQuantity: (productId: string, qty: number) => void;
  onAddProduct: (product: any) => void;
  onRemoveFromCart: (productId: string) => void;
  onRemoveAllFromCart: () => void;
  isInCart: (productId: string) => boolean;
  getCartQuantity: (productId: string) => number;
}

export function OrganizationWishlistSection({
  orgWishlist,
  organizationName,
  selectedQuantities,
  cartTotalForOrg,
  onQuantityChange,
  onSetQuantity,
  onAddProduct,
  onRemoveFromCart,
  onRemoveAllFromCart,
  isInCart,
  getCartQuantity,
}: OrganizationWishlistSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          Potrzeby organizacji
        </h2>
        <p className="text-muted-foreground text-sm">
          Ogólne zapotrzebowanie dla wszystkich podopiecznych
        </p>
      </div>

      {orgWishlist.length === 0 ? (
        <Card className="bg-white/60 border-white/50 shadow-md">
          <div className="p-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-medium">
              Lista potrzeb w trakcie tworzenia...
            </p>
          </div>
        </Card>
      ) : (
        <Card className="bg-white/80 border-white/50 shadow-md">
          <div className="p-6 flex flex-col max-h-[400px]">
            <div className="space-y-3 overflow-y-auto pr-2">
              <TooltipProvider>
                {orgWishlist.map((item: any) => {
                  const quantity = selectedQuantities[item.product_id] || 1;
                  const itemInCart = isInCart(item.product_id);
                  const cartQuantity = getCartQuantity(item.product_id);

                  return (
                    <WishlistProductCard
                      key={item.id}
                      product={{
                        id: item.id,
                        product_id: item.product_id,
                        name: item.products?.name || '',
                        price: item.products?.price || 0,
                        image_url: item.products?.image_url,
                        description: item.products?.description,
                        bought: false,
                      }}
                      quantity={quantity}
                      isInCart={itemInCart}
                      cartQuantity={cartQuantity}
                      onQuantityChange={(productId, change) => onQuantityChange(productId, change)}
                      onSetQuantity={(productId, qty) => onSetQuantity(productId, qty)}
                      onAddToCart={onAddProduct}
                      onRemoveFromCart={onRemoveFromCart}
                      showSmartFill={false}
                      unlimitedQuantity={true}
                    />
                  );
                })}
              </TooltipProvider>
            </div>

            {cartTotalForOrg > 0 && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm text-muted-foreground">
                    Łącznie w koszyku:
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {cartTotalForOrg.toFixed(2)} zł
                  </span>
                </div>
                
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
                        Wszystkie produkty dla organizacji {organizationName} zostaną usunięte z koszyka.
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
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
