import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Heart, Cake, Users } from "lucide-react";
import { formatDetailedAge } from "@/lib/utils/ageCalculator";

interface AnimalInfoCardProps {
  animal: any;
  onOpenLightbox: (index: number) => void;
}

export function AnimalInfoCard({ animal, onOpenLightbox }: AnimalInfoCardProps) {
  const ageDisplay = animal?.birth_date 
    ? formatDetailedAge(animal.birth_date)
    : animal?.age || 'Wiek nieznany';

  return (
    <Card className="p-6 md:p-8 rounded-3xl">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          <div 
            className="w-64 h-64 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-bubbly mb-3 cursor-pointer"
            onClick={() => onOpenLightbox(0)}
          >
            <img 
              src={animal.image || '/placeholder.svg'} 
              alt={animal.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Gallery thumbnails */}
          {animal.gallery && animal.gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-2 w-64">
              {animal.gallery.slice(0, 3).map((img: any, idx: number) => (
                <div 
                  key={img.id} 
                  className="aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onOpenLightbox(idx + 1)}
                >
                  <img 
                    src={img.image_url} 
                    alt={`${animal.name} gallery`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">{animal.name}</h1>
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <PawPrint className="h-4 w-4 mr-1" />
                {animal.species}
              </Badge>
            </div>
          </div>

          {/* Metryczka */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Metryczka
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Gatunek</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{animal.species}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <Cake className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Wiek</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{ageDisplay}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Organizacja</span>
                </div>
                <Link 
                  to={`/organizacje/${animal.organizationSlug}`}
                  className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline"
                >
                  {animal.organization}
                </Link>
              </div>
            </div>
          </div>

          {/* O mnie */}
          {animal.description && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3">O mnie</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {animal.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
