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
      className="group overflow-hidden bg-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-2 rounded-3xl border-2 border-border/50 cursor-pointer"
      onClick={() => window.location.href = `/zwierze/${animal.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl">
        <img 
          src={animal.image} 
          alt={`${animal.name} - ${animal.species.toLowerCase()} szukający domu`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
            <Heart className="h-5 w-5 text-accent fill-accent" />
          </div>
        </div>
        {/* Progress indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Lista życzeń</span>
              <span className="text-sm font-bold text-primary">{animal.wishlistProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${animal.wishlistProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{animal.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{animal.age}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{animal.location}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {animal.description}
        </p>

        {/* Urgent needs */}
        {animal.urgentNeeds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {animal.urgentNeeds.slice(0, 2).map((need, index) => (
              <span 
                key={index}
                className="bg-accent/10 text-accent text-xs px-3 py-1 rounded-full font-medium"
              >
                {need}
              </span>
            ))}
            {animal.urgentNeeds.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{animal.urgentNeeds.length - 2} więcej
              </span>
            )}
          </div>
        )}

        {/* Organization */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3">
            <span className="font-medium">{animal.organization}</span>
          </p>
          
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => window.location.href = `/zwierze/${animal.id}`}
            >
              Zobacz potrzeby
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnimalCard;