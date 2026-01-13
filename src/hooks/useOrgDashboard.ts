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

      // Get animals with wishlist data including product_id
      const { data: animals } = await supabase
        .from("animals")
        .select(`
          *,
          animal_wishlists(quantity, product_id)
        `)
        .eq("organization_id", orgId)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      // Get fulfilled items for all animals - matching by product_id
      const animalIdsForOrders = animals?.map((a) => a.id) || [];
      
      // Get all order_items with product_id for these animals from completed orders
      const { data: completedOrders } = await supabase
        .from("orders")
        .select("id")
        .eq("payment_status", "completed");
      
      const completedOrderIds = completedOrders?.map(o => o.id) || [];
      
      let orderItems: { animal_id: string; product_id: string; quantity: number }[] = [];
      if (completedOrderIds.length > 0 && animalIdsForOrders.length > 0) {
        const { data } = await supabase
          .from("order_items")
          .select("animal_id, product_id, quantity")
          .in("animal_id", animalIdsForOrders)
          .in("order_id", completedOrderIds)
          .not("product_id", "is", null);
        orderItems = data || [];
      }

      // Create a map of purchased product quantities per animal
      const purchasedMap = new Map<string, number>();
      orderItems.forEach(item => {
        if (item.product_id) {
          const key = `${item.animal_id}-${item.product_id}`;
          purchasedMap.set(key, (purchasedMap.get(key) || 0) + item.quantity);
        }
      });

      // Calculate stats for each animal based on wishlist items
      const animalsWithStats: AnimalWithStats[] =
        animals?.map((animal) => {
          const wishlistItems = (animal as any).animal_wishlists || [];
          
          // Count total items needed from wishlist
          const totalNeeded = wishlistItems.length;
          
          // Count how many wishlist items are fully bought
          let fulfilledCount = 0;
          wishlistItems.forEach((item: { product_id: string; quantity: number }) => {
            const key = `${animal.id}-${item.product_id}`;
            const purchasedQty = purchasedMap.get(key) || 0;
            if (purchasedQty >= (item.quantity || 1)) {
              fulfilledCount++;
            }
          });
          
          const progress = totalNeeded > 0 
            ? Math.round((fulfilledCount / totalNeeded) * 100) 
            : 0;

          return {
            ...animal,
            wishlistStats: {
              totalNeeded,
              fulfilled: fulfilledCount,
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
