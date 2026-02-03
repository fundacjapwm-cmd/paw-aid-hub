import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminOrganizations } from '@/hooks/useAdminOrganizations';
import { OrganizationCreateForm } from '@/components/admin/OrganizationCreateForm';
import { OrganizationListItem } from '@/components/admin/OrganizationListItem';

export default function AdminOrganizations() {
  const {
    user,
    isAdmin,
    authLoading,
    organizations,
    isLoading,
    editingOrg,
    newOrg,
    setEditingOrg,
    setNewOrg,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    toggleTermsAcceptance,
  } = useAdminOrganizations();

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p>Ładowanie...</p></div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="md:px-8 px-4 grid gap-6">
      <OrganizationCreateForm
        newOrg={newOrg}
        isLoading={isLoading}
        onNewOrgChange={setNewOrg}
        onCreateOrganization={createOrganization}
      />

      <Card className="rounded-3xl shadow-bubbly">
        <CardHeader>
          <CardTitle>Lista organizacji ({organizations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map((org) => (
              <OrganizationListItem
                key={org.id}
                organization={org}
                editingOrg={editingOrg}
                onEdit={setEditingOrg}
                onEditChange={setEditingOrg}
                onSave={updateOrganization}
                onDelete={deleteOrganization}
                onToggleTermsAcceptance={toggleTermsAcceptance}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
