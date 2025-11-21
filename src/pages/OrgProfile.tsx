import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import OrgLayout from "@/components/organization/OrgLayout";
import OrgProfileForm from "@/components/organization/OrgProfileForm";

export default function OrgProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [isOwner, setIsOwner] = useState(false);

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
    const { data: orgUser } = await supabase
      .from("organization_users")
      .select("organization_id, is_owner, organizations(name)")
      .eq("user_id", user?.id)
      .single();

    if (orgUser) {
      setOrganizationId(orgUser.organization_id);
      setIsOwner(orgUser.is_owner || false);
      setOrganizationName((orgUser.organizations as any).name);
    }
  };

  if (!user || profile?.role !== "ORG") {
    return null;
  }

  return (
    <OrgLayout organizationName={organizationName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profil Organizacji</h2>
          <p className="text-muted-foreground">
            Zarządzaj danymi swojej organizacji
          </p>
        </div>

        {organizationId && (
          <OrgProfileForm organizationId={organizationId} isOwner={isOwner} />
        )}
      </div>
    </OrgLayout>
  );
}
