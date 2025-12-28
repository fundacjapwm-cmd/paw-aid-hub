import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, PawPrint, ShoppingCart, CheckCircle, ExternalLink } from "lucide-react";
import { AnimalWithStats } from "@/hooks/useOrgDashboard";
import { useNavigate } from "react-router-dom";

interface DashboardAnimalCardProps {
  animal: AnimalWithStats;
  onEdit: (animal: AnimalWithStats, e: React.MouseEvent) => void;
  onDelete: (animal: AnimalWithStats, e: React.MouseEvent) => void;
  onClick: () => void;
}

export default function DashboardAnimalCard({
  animal,
  onEdit,
  onDelete,
  onClick,
}: DashboardAnimalCardProps) {
  const navigate = useNavigate();
  const { totalNeeded, fulfilled, progress } = animal.wishlistStats;
  const isComplete = progress >= 100;

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/zwierze/${animal.id}`);
  };

  return (
    <Card
      className="overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer shadow-card transition-all"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Avatar */}
          <Avatar className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl flex-shrink-0">
            <AvatarImage
              src={animal.image_url || ""}
              alt={animal.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-xl sm:rounded-2xl bg-primary/10 text-primary text-lg sm:text-xl">
              <PawPrint className="h-6 w-6 sm:h-8 sm:w-8" />
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
            <div className="flex items-start justify-between gap-1 sm:gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{animal.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{animal.species}</p>
              </div>
              <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={handleViewProfile}
                  title="Zobacz profil publiczny"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={(e) => onEdit(animal, e)}
                  title="Edytuj"
                >
                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                  onClick={(e) => onDelete(animal, e)}
                  title="Usuń"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Wishlist Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  {isComplete ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <ShoppingCart className="h-3 w-3" />
                  )}
                  <span>Lista potrzeb</span>
                  <span className="font-medium text-foreground">
                    {fulfilled}/{totalNeeded} ({Math.round(progress)}%)
                  </span>
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-1.5 sm:h-2"
                style={{
                  ['--progress-color' as string]: progress === 0 
                    ? 'hsl(0, 0%, 65%)' 
                    : `hsl(${30 + (progress * 1.12)}, ${progress * 0.71}%, ${50 - (progress * 0.05)}%)`
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}