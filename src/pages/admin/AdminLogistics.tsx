import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProducersTab from "@/components/admin/logistics/ProducersTab";
import OrganizationsTab from "@/components/admin/logistics/OrganizationsTab";
import ArchiveTab from "@/components/admin/logistics/ArchiveTab";

export default function AdminLogistics() {
  return (
    <div className="md:px-8 px-4 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Zamówienia Oczekujące
        </h2>
        <p className="text-muted-foreground">
          Przygotuj listy zakupowe dla producentów oraz przewozowe dla organizacji
        </p>
      </div>

      <Tabs defaultValue="producers" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="producers">Wg Producenta</TabsTrigger>
          <TabsTrigger value="organizations">Wg Organizacji</TabsTrigger>
          <TabsTrigger value="archive">Archiwum</TabsTrigger>
        </TabsList>
        
        <TabsContent value="producers" className="mt-6">
          <ProducersTab />
        </TabsContent>
        
        <TabsContent value="organizations" className="mt-6">
          <OrganizationsTab />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <ArchiveTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
