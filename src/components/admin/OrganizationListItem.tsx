import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2 } from 'lucide-react';
import { Organization } from '@/hooks/useAdminOrganizations';

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
    <div className="flex items-center justify-between p-4 border rounded-2xl">
      <div>
        <h3 className="font-semibold">{organization.name}</h3>
        <p className="text-sm text-muted-foreground">{organization.contact_email}</p>
        <p className="text-xs text-muted-foreground">Slug: {organization.slug}</p>
      </div>
      <div className="flex gap-2">
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
