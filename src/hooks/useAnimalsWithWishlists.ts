import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  urgent: boolean;
  bought: boolean;
  product_id: string;
  quantity: number; // Max quantity from wishlist
}

export interface GalleryImage {
  id: string;
  image_url: string;
  display_order: number;
}

export interface Animal {
  id: string;
  name: string;
  age: string;
  species: string;
  location: string;
  organization: string;
  organizationSlug: string;
  organization_id: string;
  city: string;
  description: string;
  image: string;
  created_at: string;
  wishlist: WishlistItem[];
  gallery: GalleryImage[];
  birth_date?: string | null;
}

export const useAnimalsWithWishlists = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      
      // Fetch animals with organizations - simplified to avoid RLS recursion
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select('id, name, species, age, breed, description, image_url, organization_id, created_at, birth_date')
        .eq('active', true);

      if (animalsError) throw animalsError;

      // Fetch organizations separately
      const orgIds = animalsData?.map(a => a.organization_id).filter(Boolean) || [];
      
      let orgsData = [];
      if (orgIds.length > 0) {
        const { data, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name, slug, city')
          .in('id', orgIds);

        if (orgsError) throw orgsError;
        orgsData = data || [];
      }

      // Create org lookup map
      const orgMap = new Map(orgsData?.map(org => [org.id, org]) || []);

      // Fetch wishlists for all animals
      const animalIds = animalsData?.map(a => a.id) || [];
      
      const { data: wishlistsData, error: wishlistsError } = await supabase
        .from('animal_wishlists')
        .select(`
          id,
          animal_id,
          priority,
          quantity,
          products (
            id,
            name,
            price
          )
        `)
        .in('animal_id', animalIds);

      if (wishlistsError) throw wishlistsError;

      // Fetch all purchased items to mark as bought
      const { data: purchasedItems, error: purchasedError } = await supabase
        .from('order_items')
        .select('animal_id, product_id')
        .in('animal_id', animalIds);

      if (purchasedError) throw purchasedError;

      // Fetch gallery images for all animals
      const { data: galleryData, error: galleryError } = await supabase
        .from('animal_images')
        .select('id, animal_id, image_url, display_order')
        .in('animal_id', animalIds)
        .order('display_order', { ascending: true });

      if (galleryError) throw galleryError;

      // Create a set of purchased product IDs for quick lookup
      const purchasedSet = new Set(
        purchasedItems?.map(item => `${item.animal_id}-${item.product_id}`) || []
      );

      // Create gallery lookup map
      const galleryMap = new Map<string, GalleryImage[]>();
      galleryData?.forEach((img) => {
        if (!galleryMap.has(img.animal_id)) {
          galleryMap.set(img.animal_id, []);
        }
        galleryMap.get(img.animal_id)?.push({
          id: img.id,
          image_url: img.image_url,
          display_order: img.display_order
        });
      });

      // Transform data to match component interface
      const transformedAnimals: Animal[] = animalsData?.map(animal => {
        const org = orgMap.get(animal.organization_id);
        const animalWishlists = wishlistsData?.filter(w => w.animal_id === animal.id) || [];
        const gallery = galleryMap.get(animal.id) || [];
        
        return {
          id: animal.id,
          name: animal.name,
          age: animal.age ? `${animal.age} lat` : 'nieznany',
          species: animal.species,
          location: org?.city || 'Polska',
          organization: org?.name || 'Nieznana organizacja',
          organizationSlug: org?.slug || '',
          organization_id: animal.organization_id || '',
          city: org?.city || '',
          description: animal.description || '',
          image: animal.image_url || '/placeholder.svg',
          created_at: animal.created_at || '',
          birth_date: animal.birth_date,
          wishlist: animalWishlists.map(w => ({
            id: w.id,
            name: w.products?.name || '',
            price: w.products?.price || 0,
            urgent: w.priority === 1,
            bought: purchasedSet.has(`${animal.id}-${w.products?.id}`),
            product_id: w.products?.id || '',
            quantity: w.quantity || 1,
          })),
          gallery: gallery,
        };
      }) || [];

      setAnimals(transformedAnimals);
      setError(null);
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();

    // Set up realtime subscription for order_items changes
    const channel = supabase
      .channel('order_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          // Refetch animals when orders change
          fetchAnimals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { animals, loading, error, refetch: fetchAnimals };
};
