import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AnimalCard from "@/components/AnimalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Phone, Mail, Users, ShieldCheck, PawPrint, Calendar, Bone } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E5] via-white to-[#FFF0F5] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      {/* Hero Section - Centralna Karta */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Card */}
          <div className="relative bg-white/60 backdrop-blur-md border border-white/50 shadow-bubbly rounded-[3rem] p-8 md:p-12 text-center overflow-hidden mb-12">
            {/* Dekoracyjne ikony w tle */}
            <Heart className="absolute top-8 left-8 h-24 w-24 text-primary/5 -rotate-12" />
            <Bone className="absolute bottom-8 right-8 h-32 w-32 text-accent/5 rotate-12" />
            <PawPrint className="absolute top-1/2 right-12 h-16 w-16 text-secondary/5 -rotate-6" />

            {/* Logo */}
            <div className="relative z-10 mb-6">
              <div className="inline-block rounded-full border-4 border-white shadow-lg overflow-hidden w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 to-accent/10">
                {organization.logo_url ? (
                  <img 
                    src={organization.logo_url} 
                    alt={organization.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="h-16 w-16 text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Tytuł z weryfikacją */}
            <div className="relative z-10 mb-4">
              <h1 className="text-4xl font-bold text-foreground tracking-tight inline-flex items-center gap-3 flex-wrap justify-center">
                {organization.name}
                <span title="Zweryfikowana Organizacja">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </span>
              </h1>
            </div>

            {/* Opis */}
            {organization.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 relative z-10 leading-relaxed">
                {organization.description}
              </p>
            )}

            {/* Statystyki - Kolorowe Badge'y */}
            <div className="flex justify-center gap-4 flex-wrap mb-8 relative z-10">
              {organization.city && (
                <div className="bg-blue-50 text-blue-600 rounded-full px-4 py-2 font-semibold shadow-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {organization.city}
                </div>
              )}
              
              <div className="bg-orange-50 text-orange-600 rounded-full px-4 py-2 font-semibold shadow-sm flex items-center gap-2">
                <PawPrint className="h-4 w-4" />
                {animals.length} Podopiecznych
              </div>

              <div className="bg-green-50 text-green-600 rounded-full px-4 py-2 font-semibold shadow-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Z nami od 2024
              </div>
            </div>

            {/* Kontakt w Hero */}
            <div className="flex flex-wrap justify-center gap-4 text-sm relative z-10">
              {organization.contact_phone && (
                <a 
                  href={`tel:${organization.contact_phone}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {organization.contact_phone}
                </a>
              )}
              <a 
                href={`mailto:${organization.contact_email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                {organization.contact_email}
              </a>
            </div>
          </div>

          {/* Galeria miniatur */}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-12">
              {galleryImages.slice(0, 6).map((image) => (
                <div 
                  key={image.id}
                  className="aspect-square overflow-hidden rounded-2xl shadow-card hover:shadow-bubbly hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src={image.image_url}
                    alt="Galeria organizacji"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Animals Section */}
      <div id="animals" className="container mx-auto px-4 pb-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Nasi Podopieczni 🐶🐱
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    })),
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
