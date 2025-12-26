import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Pencil, Mail, Phone, Globe, Hash } from "lucide-react";
import { toast } from "sonner";

interface DashboardHeaderProps {
  organization: any;
  uploadingLogo: boolean;
  onLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick: () => void;
}

export default function DashboardHeader({
  organization,
  uploadingLogo,
  onLogoSelect,
  onEditClick,
}: DashboardHeaderProps) {
  if (!organization) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border/50">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Top Section - Logo, Name, Edit Button */}
        <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
          {/* Clickable Avatar for Logo Change */}
          <div className="relative group flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              onChange={onLogoSelect}
              disabled={uploadingLogo}
              className="hidden"
              id="logo-upload-dashboard"
            />
            <label htmlFor="logo-upload-dashboard" className="cursor-pointer block">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-2 sm:border-4 border-white shadow-card transition-opacity group-hover:opacity-80">
                <AvatarImage src={organization?.logo_url || ""} alt={organization?.name} />
                <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-primary/10 text-primary">
                  {organization?.name?.charAt(0) || "O"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground truncate">
                {organization?.name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                onClick={onEditClick}
              >
                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            {organization?.description && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-2">
                {organization.description}
              </p>
            )}
          </div>
        </div>

        {/* Organization Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {organization?.city && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="truncate">
                {organization.city}
                {organization.province && `, ${organization.province}`}
              </span>
            </div>
          )}
          {organization?.contact_email && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="truncate">{organization.contact_email}</span>
            </div>
          )}
          {organization?.contact_phone && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span>{organization.contact_phone}</span>
            </div>
          )}
          {organization?.website && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-primary"
              >
                {organization.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {organization?.nip && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span>NIP: {organization.nip}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
