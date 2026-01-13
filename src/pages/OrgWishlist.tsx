import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserOrganization } from "@/hooks/useUserOrganization";
import OrgLayout from "@/components/organization/OrgLayout";
import WishlistBuilder from "@/components/organization/WishlistBuilder";

export default function OrgWishlist() {
  const { user, profile } = useAuth();
  const { hasOrganization, organization, loading: orgLoading } = useUserOrganization();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Wait for organization loading to complete
    if (orgLoading) return;

    // Allow access if user has ORG role OR is assigned to an organization
    const canAccess = profile?.role === "ORG" || hasOrganization;
    if (!canAccess) {
      navigate("/");
    }
  }, [user, profile, hasOrganization, orgLoading, navigate]);

  // Wait for loading or redirect if no access
  const canAccess = profile?.role === "ORG" || hasOrganization;
  if (!user || orgLoading || !canAccess || !organization) {
    return null;
  }

  return (
    <OrgLayout organizationName={organization.organization_name || ""}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4">
            Ogólna Lista Potrzeb
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Zarządzaj ogólnymi potrzebami organizacji
          </p>
        </div>

        <WishlistBuilder
          entityId={organization.organization_id}
          entityName={organization.organization_name || ""}
          entityType="organization"
        />
      </div>
    </OrgLayout>
  );
}
