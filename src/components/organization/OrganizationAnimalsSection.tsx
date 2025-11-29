import { Heart } from "lucide-react";
import AnimalCard from "@/components/AnimalCard";
import { Organization } from "@/hooks/useOrganizationProfile";

interface OrganizationAnimalsSectionProps {
  animals: any[];
  organization: Organization;
}

export function OrganizationAnimalsSection({ animals, organization }: OrganizationAnimalsSectionProps) {
  return (
    <div id="animals" className="md:container md:mx-auto md:px-8 pb-16 px-4 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-2">
          Nasi Podopieczni
        </h2>
        <p className="text-lg text-muted-foreground">
          Każdy z nich czeka na Twoją pomoc
        </p>
      </div>
      
      {animals.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/60 backdrop-blur-md border border-white/50 shadow-bubbly rounded-[3rem] p-12 text-center">
            <Heart className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl text-muted-foreground">
              Ta organizacja nie ma jeszcze żadnych podopiecznych
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {animals.map((animal) => (
            <div 
              key={animal.id}
              className="hover:-translate-y-2 transition-transform duration-300"
            >
              <AnimalCard
                animal={{
                  id: animal.id,
                  name: animal.name,
                  species: animal.species,
                  age: animal.age?.toString() || 'Nieznany',
                  location: organization.city || 'Polska',
                  organization: organization.name,
                  organizationSlug: organization.slug,
                  description: animal.description || '',
                  image: animal.image_url || '/placeholder.svg',
                  wishlist: (animal.animal_wishlists || []).map((w: any) => ({
                    id: w.id,
                    name: w.products?.name || '',
                    price: w.products?.price || 0,
                    product_id: w.product_id,
                    quantity: w.quantity,
                    bought: false,
                    image_url: w.products?.image_url,
                  })),
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
