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
      className="overflow-hidden rounded-3xl cursor-pointer shadow-card transition-all"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Avatar */}
          <Avatar className="h-20 w-20 rounded-2xl flex-shrink-0">
            <AvatarImage
              src={animal.image_url || ""}
              alt={animal.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-xl">
              <PawPrint className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg truncate">{animal.name}</h3>
                <p className="text-sm text-muted-foreground">{animal.species}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleViewProfile}
                  title="Zobacz profil publiczny"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => onEdit(animal, e)}
                  title="Edytuj"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => onDelete(animal, e)}
                  title="Usuń"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Wishlist Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  {isComplete ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <ShoppingCart className="h-3 w-3" />
                  )}
                  Lista potrzeb
                </span>
                <span className="font-medium">
                  {fulfilled}/{totalNeeded} ({Math.round(progress)}%)
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
