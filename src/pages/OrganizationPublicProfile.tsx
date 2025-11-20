import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section with Background Image */}
      <div className="relative">
        {/* Background Image Container */}
        <div 
          className="relative h-[400px] bg-gradient-to-br from-primary via-primary/90 to-primary/80 overflow-hidden"
          style={{
            backgroundImage: organization.logo_url 
              ? `linear-gradient(to bottom right, rgba(239, 126, 50, 0.85), rgba(239, 126, 50, 0.95)), url(${organization.logo_url})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Name and Location Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {organization.name}
            </h1>
            {(organization.city || organization.province) && (
              <div className="flex items-center gap-2 text-white/90 text-lg drop-shadow">
                <MapPin className="h-5 w-5" />
                <span>
                  {organization.city}
                  {organization.province && `, ${organization.province}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards Container - Positioned to overlap the hero */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="max-w-2xl mx-auto">
            {organization.description && (
              <Card className="rounded-2xl shadow-card mb-4 bg-background/95 backdrop-blur">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">{organization.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Animals Count Card */}
              <Card className="rounded-2xl shadow-card">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-foreground mb-1">{animals.length}</div>
                  <div className="text-sm text-muted-foreground">podopiecznych</div>
                </CardContent>
              </Card>

              {/* Active Organization Card */}
              <Card className="rounded-2xl shadow-card">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-lg font-bold text-foreground mb-1">Aktywna</div>
                  <div className="text-sm text-muted-foreground">organizacja</div>
                  {(organization.address || organization.city) && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {organization.address && <div>{organization.address}</div>}
                      {organization.postal_code && organization.city && (
                        <div>{organization.postal_code} {organization.city}</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <Card className="rounded-2xl shadow-card mb-4">
              <CardContent className="p-6 space-y-3">
                {organization.contact_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${organization.contact_phone}`} className="text-foreground hover:text-primary">
                      {organization.contact_phone}
                    </a>
                  </div>
                )}
                {organization.contact_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${organization.contact_email}`} className="text-foreground hover:text-primary">
                      {organization.contact_email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA Button */}
            <Button 
              asChild
              className="w-full rounded-2xl h-12 text-base font-semibold shadow-soft"
            >
              <Link to={`/organizacje/${organization.slug}`}>
                Zobacz profil organizacji
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <Card className="rounded-3xl shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Galeria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image) => (
                  <div key={image.id} className="aspect-square overflow-hidden rounded-xl border border-border shadow-soft hover:scale-105 transition-transform">
                    <img
                      src={image.image_url}
                      alt="Zdjęcie organizacji"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Animals Section */}
      <div className="container mx-auto px-4 py-12">
        <Card className="rounded-3xl shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Nasi Podopieczni</CardTitle>
          </CardHeader>
          <CardContent>
            {animals.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  Ta organizacja nie ma jeszcze żadnych podopiecznych
                </p>
              </div>
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
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="rounded-3xl shadow-card">
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Chcesz pomóc lub adoptować jednego z naszych podopiecznych?
            </p>
            <a
              href={`mailto:${organization.contact_email}`}
              className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:scale-105 transition-transform shadow-soft"
            >
              Skontaktuj się z nami
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
