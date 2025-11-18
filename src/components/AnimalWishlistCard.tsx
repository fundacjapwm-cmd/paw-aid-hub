import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ShoppingCart } from "lucide-react";
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
  const totalPrice = animal.products.reduce((sum, product) => sum + product.price, 0);

  const handleAddProduct = (product: Product) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      animalId: animal.id,
      animalName: animal.name,
    });
  };

  const handleBuyAll = () => {
    const items = animal.products.map(product => ({
      productId: product.id,
      productName: product.name,
      price: product.price,
      animalId: animal.id,
      animalName: animal.name,
    }));
    addAllForAnimal(items, animal.name);
  };

  return (
    <Card className="overflow-hidden bg-card rounded-3xl border-0 shadow-card">
      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Left Side: Animal Description */}
        <div className="space-y-4">
          <div>
            <Link to={`/zwierze/${animal.id}`} className="hover:text-primary transition-colors">
              <h3 className="text-2xl font-bold text-foreground mb-1">{animal.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground">{animal.age}</p>
          </div>
          <p className="text-foreground leading-relaxed">{animal.description}</p>
        </div>

        {/* Right Side: Product Wishlist */}
        <div className="bg-muted/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg text-foreground">Produkty dla {animal.name}</h4>
            <span className="text-primary font-bold text-lg">{totalPrice.toFixed(2)} zł</span>
          </div>

          {animal.products.length > 0 ? (
            <>
              <div className="space-y-3 mb-4">
                {animal.products.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 bg-background rounded-xl p-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                      <p className="text-primary font-bold text-sm">{product.price.toFixed(2)} zł</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 rounded-full"
                      onClick={() => handleAddProduct(product)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                className="w-full rounded-2xl font-bold"
                size="lg"
                onClick={handleBuyAll}
              >
                Kup wszystko dla {animal.name} ({totalPrice.toFixed(2)} zł)
              </Button>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Brak produktów w wishliście
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AnimalWishlistCard;