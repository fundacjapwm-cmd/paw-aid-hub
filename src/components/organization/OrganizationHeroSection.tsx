import { Heart, ShieldCheck } from "lucide-react";
import { Organization } from "@/hooks/useOrganizationProfile";

interface OrganizationHeroSectionProps {
  organization: Organization;
}

export function OrganizationHeroSection({ organization }: OrganizationHeroSectionProps) {
  return (
    <div className="flex items-start gap-6">
      <div className="shrink-0">
        <div className="h-32 w-32 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-white">
          {organization.logo_url ? (
            <img 
              src={organization.logo_url} 
              alt={organization.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <Heart className="h-16 w-16 text-primary" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {organization.name}
          </h1>
          <span title="Zweryfikowana Organizacja">
            <ShieldCheck className="h-7 w-7 text-primary shrink-0" />
          </span>
        </div>
        {organization.description && (
          <p className="text-muted-foreground leading-relaxed">
            {organization.description}
          </p>
        )}
      </div>
    </div>
  );
}
