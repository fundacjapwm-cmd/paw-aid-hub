import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AnimalCard from "@/components/AnimalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Phone, Mail, Users } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  city?: string;
  province?: string;
  address?: string;
  postal_code?: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  nip?: string;
  regon?: string;
}

export default function OrganizationPublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchOrganization();
    }
  }, [slug]);

  const fetchOrganization = async () => {
    try {
      // Fetch organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

      if (orgError) throw orgError;
      if (!org) {
        setLoading(false);
        return;
      }

      setOrganization(org);

      // Fetch organization's animals
      const { data: animalsData, error: animalsError } = await supabase
        .from("animals")
        .select(`
          *,
          animal_wishlists (
            id,
            product_id,
            quantity,
            products (
              id,
              name,
              price,
              image_url
            )
          )
        `)
        .eq("organization_id", org.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (animalsError) throw animalsError;

      setAnimals(animalsData || []);

      // Fetch organization's gallery images
      const { data: imagesData, error: imagesError } = await supabase
        .from("organization_images")
        .select("*")
        .eq("organization_id", org.id)
        .order("display_order", { ascending: true });

      if (imagesError) throw imagesError;

      setGalleryImages(imagesData || []);
    } catch (error) {
      console.error("Error fetching organization:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Ładowanie profilu organizacji...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Organizacja nie znaleziona</h2>
          <p className="text-muted-foreground">Sprawdź adres URL i spróbuj ponownie</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Section - Hero Photo + Info Card */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Main Photo + Gallery */}
          <div>
            {/* Main Organization Photo */}
            <div 
              className="relative h-[350px] rounded-3xl overflow-hidden shadow-card mb-4"
              style={{
                backgroundImage: organization.logo_url ? `url(${organization.logo_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!organization.logo_url && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Heart className="h-24 w-24 text-white/20" />
                </div>
              )}
              {/* Shadow gradient at bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">
                  {organization.name}
                </h1>
              </div>
            </div>

            {/* Gallery Miniatures */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-6 gap-2">
                {galleryImages.slice(0, 6).map((image) => (
                  <div 
                    key={image.id} 
                    className="aspect-square overflow-hidden rounded-xl border border-border hover:scale-105 transition-transform cursor-pointer"
                  >
                    <img
                      src={image.image_url}
                      alt="Miniatura galerii"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <Card className="rounded-3xl shadow-card h-fit">
            <CardContent className="p-6 space-y-6">
              {/* Animals Count */}
              <div className="text-center pb-6 border-b border-border">
                <Heart className="h-12 w-12 text-primary mx-auto mb-3 fill-current" />
                <div className="text-4xl font-bold text-foreground mb-1">{animals.length}</div>
                <div className="text-muted-foreground">podopiecznych czeka na pomoc</div>
              </div>

              {/* Address and Contact - Side by Side */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border">
                {/* Address */}
                {(organization.address || organization.city) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      Adres
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {organization.address && <div>{organization.address}</div>}
                      {organization.postal_code && organization.city && (
                        <div>{organization.postal_code} {organization.city}</div>
                      )}
                      {!organization.address && organization.city && (
                        <div>{organization.city}{organization.province && `, ${organization.province}`}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    Kontakt
                  </div>
                  <div className="space-y-2">
                    {organization.contact_phone && (
                      <a 
                        href={`tel:${organization.contact_phone}`} 
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {organization.contact_phone}
                      </a>
                    )}
                    <a 
                      href={`mailto:${organization.contact_email}`} 
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {organization.contact_email}
                    </a>
                  </div>
                </div>
              </div>

              {/* About Us Section */}
              {organization.description && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    O nas
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {organization.description}
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <Button 
                asChild
                className="w-full rounded-2xl h-12 text-base font-semibold shadow-soft"
              >
                <a href="#animals">
                  Zobacz podopiecznych
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animals Section */}
      <div id="animals" className="container mx-auto px-4 pb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6">Nasi Podopieczni</h2>
        
        {animals.length === 0 ? (
          <Card className="rounded-3xl shadow-card">
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Ta organizacja nie ma jeszcze żadnych podopiecznych
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((animal) => (
              <AnimalCard
                key={animal.id}
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
                  })),
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contact CTA Section */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="rounded-3xl shadow-card bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Chcesz pomóc?</h3>
            <p className="text-muted-foreground mb-6">
              Skontaktuj się z nami, aby adoptować jednego z naszych podopiecznych lub wesprzeć naszą działalność.
            </p>
            <a
              href={`mailto:${organization.contact_email}`}
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-2xl hover:scale-105 transition-transform shadow-soft font-semibold"
            >
              Skontaktuj się z nami
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
