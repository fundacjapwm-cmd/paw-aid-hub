import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Organization } from '@/hooks/useAdminOrganizations';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface OrganizationListItemProps {
  organization: Organization;
  editingOrg: Organization | null;
  onEdit: (org: Organization) => void;
  onEditChange: (org: Organization) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}

export function OrganizationListItem({
  organization,
  editingOrg,
  onEdit,
  onEditChange,
  onSave,
  onDelete,
}: OrganizationListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-2xl hover:bg-muted/30 transition-colors">
      <Link to={`/admin/organizacje/${organization.id}`} className="flex-1 cursor-pointer">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold hover:text-primary transition-colors">{organization.name}</h3>
            {organization.terms_accepted_at ? (
              <Badge variant="default" className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                <CheckCircle className="h-3 w-3" />
                Regulamin zaakceptowany
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">
                <XCircle className="h-3 w-3" />
                Brak akceptacji
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{organization.contact_email}</p>
          <p className="text-xs text-muted-foreground">Slug: {organization.slug}</p>
          {organization.terms_accepted_at && (
            <p className="text-xs text-green-600">
              Zaakceptowano: {format(new Date(organization.terms_accepted_at), "d MMMM yyyy, HH:mm", { locale: pl })}
            </p>
          )}
        </div>
      </Link>
      <div className="flex gap-2 ml-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => onEdit(organization)}>
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edytuj organizację</DialogTitle>
              <DialogDescription>Zmień dane organizacji</DialogDescription>
            </DialogHeader>
            {editingOrg && editingOrg.id === organization.id && (
              <div className="space-y-4">
                <div>
                  <Label>Nazwa</Label>
                  <Input
                    value={editingOrg.name}
                    onChange={(e) => onEditChange({...editingOrg, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={editingOrg.slug}
                    onChange={(e) => onEditChange({...editingOrg, slug: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email kontaktowy</Label>
                  <Input
                    value={editingOrg.contact_email}
                    onChange={(e) => onEditChange({...editingOrg, contact_email: e.target.value})}
                  />
                </div>
                <Button onClick={onSave}>Zapisz zmiany</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => onDelete(organization.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
