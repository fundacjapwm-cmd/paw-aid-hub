import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface Animal {
  id: string;
  name: string;
  age: string;
  description: string;
  products: Product[];
}

interface AnimalWishlistCardProps {
  animal: Animal;
}

const AnimalWishlistCard = ({ animal }: AnimalWishlistCardProps) => {
  const { addToCart, addAllForAnimal } = useCart();
  
  // State for quantity counters - każdy produkt ma swoją ilość
  const [quantities, setQuantities] = useState<Record<string, number>>(
    animal.products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );

  const totalPrice = animal.products.reduce((sum, product) => sum + product.price, 0);

  const handleQuantityChange = (productId: string, change: number) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change); // Min: 1
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddProduct = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    addToCart(
      {
        productId: product.id,
        productName: product.name,
        price: product.price,
        animalId: animal.id,
        animalName: animal.name,
      },
      quantity
    );
  };

  const handleBuyAll = () => {
    const items = animal.products.map((product) => ({
      productId: product.id,
      productName: product.name,
      price: product.price,
      animalId: animal.id,
      animalName: animal.name,
      maxQuantity: quantities[product.id] || 1,
    }));
    addAllForAnimal(items, animal.name);
  };

  return (
    <Card className="overflow-hidden bg-card rounded-3xl border-0 shadow-card">
      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Left Side: Animal Description */}
        <div className="space-y-4">
          <div>
            <Link
              to={`/zwierze/${animal.id}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {animal.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{animal.age}</p>
          </div>
          <p className="text-foreground leading-relaxed">{animal.description}</p>
        </div>

        {/* Right Side: Product Wishlist - Nowy Layout z Sticky Footer */}
        <div className="bg-muted/30 rounded-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-6 pb-4">
            <h4 className="font-bold text-lg text-foreground">
              Potrzeby {animal.name}
            </h4>
          </div>

          {animal.products.length > 0 ? (
            <>
              {/* Body - Scrollable List */}
              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
                {animal.products.map((product) => {
                  const quantity = quantities[product.id] || 1;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 bg-background rounded-xl p-3"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-primary font-bold text-sm">
                          {product.price.toFixed(2)} zł
                        </p>
                      </div>

                      {/* Actions: Counter + Cart Button */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Counter */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center bg-transparent font-bold text-foreground">
                            {quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
                            onClick={() => handleQuantityChange(product.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Add to Cart Icon Button */}
                        <Button
                          size="icon"
                          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-sm"
                          onClick={() => handleAddProduct(product)}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer - Sticky Summary */}
              <div className="bg-gray-50 p-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">
                    Łącznie:
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {totalPrice.toFixed(2)} zł
                  </span>
                </div>
                <Button
                  className="w-full rounded-2xl font-bold shadow-md"
                  size="lg"
                  onClick={handleBuyAll}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Kup wszystkie produkty
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-center text-muted-foreground">
                Brak produktów w wishliście
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AnimalWishlistCard;
