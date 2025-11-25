import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import WishlistBuilder from "@/components/organization/WishlistBuilder";

export default function OrgWishlist() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile?.role !== "ORG") {
      navigate("/");
      return;
    }

    fetchOrganization();
  }, [user, profile, navigate]);

  const fetchOrganization = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("organization_users")
      .select("organization_id, organizations(id, name)")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return;
    }

    const org = data.organizations as any;
    setOrganizationId(org.id);
    setOrganizationName(org.name);
  };

  if (!user || profile?.role !== "ORG" || !organizationId) {
    return null;
  }

  return (
    <OrgLayout organizationName={organizationName}>
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-6xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Ogólna Lista Potrzeb
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Zarządzaj ogólnymi potrzebami organizacji, niezależnie od poszczególnych zwierząt
          </p>
        </div>

        <WishlistBuilder
          entityId={organizationId}
          entityName={organizationName}
          entityType="organization"
        />
      </div>
    </OrgLayout>
  );
}
