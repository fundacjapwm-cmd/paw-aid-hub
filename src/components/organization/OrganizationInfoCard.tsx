import { MapPin, PawPrint, Calendar, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Organization } from "@/hooks/useOrganizationProfile";

interface OrganizationInfoCardProps {
  organization: Organization;
  animalsCount: number;
  isLoggedIn: boolean;
}

export function OrganizationInfoCard({ organization, animalsCount, isLoggedIn }: OrganizationInfoCardProps) {
  return (
    <Card className="bg-gradient-to-br from-white/80 to-white/60 border-white/50 shadow-md">
      <div className="p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Dane organizacji
        </h3>
        
        <div className="space-y-3 text-sm">
          {organization.city && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Lokalizacja</p>
                <p className="text-muted-foreground">
                  {organization.city}
                  {organization.province && `, ${organization.province}`}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <PawPrint className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Podopieczni</p>
              <p className="text-muted-foreground">{animalsCount} zwierzaków</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Z nami od</p>
              <p className="text-muted-foreground">2024</p>
            </div>
          </div>

          {isLoggedIn && (
            <>
              {organization.contact_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <a 
                      href={`tel:${organization.contact_phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {organization.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <a 
                    href={`mailto:${organization.contact_email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {organization.contact_email}
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
