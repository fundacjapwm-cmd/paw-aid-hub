import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface OrganizationCreateFormProps {
  newOrg: {
    name: string;
    slug: string;
    contact_email: string;
  };
  isLoading: boolean;
  onNewOrgChange: (org: { name: string; slug: string; contact_email: string }) => void;
  onCreateOrganization: () => void;
}

export function OrganizationCreateForm({
  newOrg,
  isLoading,
  onNewOrgChange,
  onCreateOrganization,
}: OrganizationCreateFormProps) {
  return (
    <Card className="rounded-3xl shadow-bubbly">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Dodaj nową organizację
        </CardTitle>
        <CardDescription>
          Utwórz nową organizację
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="org-name">Nazwa organizacji</Label>
            <Input
              id="org-name"
              value={newOrg.name}
              onChange={(e) => onNewOrgChange({ ...newOrg, name: e.target.value })}
              placeholder="Fundacja Ratuj Łapki"
            />
          </div>
          <div>
            <Label htmlFor="org-slug">Slug (opcjonalny)</Label>
            <Input
              id="org-slug"
              value={newOrg.slug}
              onChange={(e) => onNewOrgChange({ ...newOrg, slug: e.target.value })}
              placeholder="fundacja-ratuj-lapki"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="org-email">Email kontaktowy organizacji</Label>
          <Input
            id="org-email"
            type="email"
            value={newOrg.contact_email}
            onChange={(e) => onNewOrgChange({ ...newOrg, contact_email: e.target.value })}
            placeholder="kontakt@ratujlapki.pl"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Na ten adres zostanie wysłane zaproszenie z linkiem do ustawienia hasła
          </p>
        </div>
        <Button onClick={onCreateOrganization} disabled={isLoading}>
          {isLoading ? 'Wysyłanie zaproszenia...' : 'Utwórz organizację i wyślij zaproszenie'}
        </Button>
      </CardContent>
    </Card>
  );
}
