import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnimalWithStats {
  id: string;
  name: string;
  species: string;
  description?: string;
  birth_date?: string;
  image_url?: string;
  organization_id: string;
  active: boolean;
  created_at: string;
  wishlistStats: {
    totalNeeded: number;
    fulfilled: number;
    progress: number;
  };
}

export interface DashboardData {
  organization: any;
  animals: AnimalWithStats[];
  stats: {
    animals: number;
    wishlistItems: number;
    requests: number;
  };
}

export function useOrgDashboard(userId: string | undefined) {
  return useQuery({
    queryKey: ["organization-dashboard", userId],
    queryFn: async (): Promise<DashboardData | null> => {
      if (!userId) return null;

      // Get organization with full details
      const { data: orgUser } = await supabase
        .from("organization_users")
        .select("organization_id, organizations(*)")
        .eq("user_id", userId)
        .single();

      const organization = orgUser?.organizations as any;
      const orgId = orgUser?.organization_id;

      if (!orgId) {
        return {
          organization: null,
          animals: [],
          stats: { animals: 0, wishlistItems: 0, requests: 0 },
        };
      }

      // Get animals with wishlist data
      const { data: animals } = await supabase
        .from("animals")
        .select(`
          *,
          animal_wishlists(quantity)
        `)
        .eq("organization_id", orgId)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      // Get fulfilled items for all animals
      const animalIdsForOrders = animals?.map((a) => a.id) || [];
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("animal_id, quantity")
        .in("animal_id", animalIdsForOrders)
        .eq("fulfillment_status", "fulfilled");

      // Calculate stats for each animal
      const animalsWithStats: AnimalWithStats[] =
        animals?.map((animal) => {
          const wishlistItems = (animal as any).animal_wishlists || [];
          const totalNeeded = wishlistItems.reduce(
            (sum: number, item: any) => sum + (item.quantity || 0),
            0
          );
          const fulfilledRaw =
            orderItems
              ?.filter((oi) => oi.animal_id === animal.id)
              .reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
          
          // Cap fulfilled at totalNeeded for display purposes
          // If totalNeeded is 0, show 0 fulfilled (wishlist is complete or empty)
          const fulfilled = totalNeeded > 0 ? Math.min(fulfilledRaw, totalNeeded) : 0;
          const progress =
            totalNeeded > 0 ? Math.min((fulfilledRaw / totalNeeded) * 100, 100) : 0;

          return {
            ...animal,
            wishlistStats: {
              totalNeeded,
              fulfilled,
              progress,
            },
          };
        }) || [];

      // Count animals
      const { count: animalsCount } = await supabase
        .from("animals")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

      // Count wishlist items
      const { data: allAnimals } = await supabase
        .from("animals")
        .select("id")
        .eq("organization_id", orgId);

      const animalIds = allAnimals?.map((a) => a.id) || [];

      const { count: wishlistCount } = await supabase
        .from("animal_wishlists")
        .select("*", { count: "exact", head: true })
        .in("animal_id", animalIds);

      // Count requests
      const { count: requestsCount } = await supabase
        .from("product_requests")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "pending");

      return {
        organization,
        animals: animalsWithStats,
        stats: {
          animals: animalsCount || 0,
          wishlistItems: wishlistCount || 0,
          requests: requestsCount || 0,
        },
      };
    },
    enabled: !!userId,
    staleTime: 300000, // 5 minutes
  });
}
