import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, Calendar } from "lucide-react";

interface Animal {
  id: number;
  name: string;
  age: string;
  species: string;
  location: string;
  organization: string;
  description: string;
  image: string;
  wishlistProgress: number;
  urgentNeeds: string[];
}

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard = ({ animal }: AnimalCardProps) => {
  return (
    <Card 
      className="group overflow-hidden bg-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-3 rounded-3xl border-0 shadow-card cursor-pointer relative"
      onClick={() => window.location.href = `/zwierze/${animal.id}`}
    >
      {/* Decorative bubbly elements */}
      <div className="absolute top-2 left-2 w-4 h-4 bg-primary/20 rounded-full animate-bounce-gentle"></div>
      <div className="absolute top-6 right-6 w-2 h-2 bg-accent/30 rounded-full animate-bounce-gentle delay-300"></div>
      
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl">
        <img 
          src={animal.image} 
          alt={`${animal.name} - ${animal.species.toLowerCase()} szukający domu`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-soft hover:scale-110 transition-transform duration-200">
            <Heart className="h-5 w-5 text-accent fill-accent animate-pulse" />
          </div>
        </div>
        {/* Progress indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Lista życzeń</span>
              <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{animal.wishlistProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${animal.wishlistProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 relative">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{animal.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 bg-muted/50 px-2 py-1 rounded-full">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{animal.age}</span>
            </div>
            <div className="flex items-center space-x-1 bg-muted/50 px-2 py-1 rounded-full">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{animal.location}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {animal.description}
        </p>

        {/* Urgent needs */}
        {animal.urgentNeeds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {animal.urgentNeeds.slice(0, 2).map((need, index) => (
              <span 
                key={index}
                className="bg-accent-light text-accent text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm"
              >
                {need}
              </span>
            ))}
            {animal.urgentNeeds.length > 2 && (
              <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">
                +{animal.urgentNeeds.length - 2} więcej
              </span>
            )}
          </div>
        )}

        {/* Organization */}
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-4 bg-muted/30 p-2 rounded-lg">
            <span className="font-semibold text-foreground">{animal.organization}</span>
          </p>
          
          <div className="flex space-x-3">
            <Button 
              variant="success" 
              size="sm" 
              className="flex-1 rounded-xl font-bold shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/zwierze/${animal.id}`;
              }}
            >
              Kup wszystko na liście
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-2 hover:shadow-soft"
              onClick={(e) => e.stopPropagation()}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnimalCard;