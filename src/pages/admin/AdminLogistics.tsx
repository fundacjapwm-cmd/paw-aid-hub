import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProducersTab from "@/components/admin/logistics/ProducersTab";
import OrganizationsTab from "@/components/admin/logistics/OrganizationsTab";

export default function AdminLogistics() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Zamówienia Zbiorcze
        </h2>
        <p className="text-muted-foreground">
          Zarządzaj logistyką dostaw: generuj listy zakupowe dla producentów oraz przewozowe dla schronisk
        </p>
      </div>

      <Tabs defaultValue="producers" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="producers">Dla Producentów</TabsTrigger>
          <TabsTrigger value="organizations">Dla Organizacji</TabsTrigger>
        </TabsList>
        
        <TabsContent value="producers" className="mt-6">
          <ProducersTab />
        </TabsContent>
        
        <TabsContent value="organizations" className="mt-6">
          <OrganizationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
