import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingOrdersTab from "@/components/admin/logistics/PendingOrdersTab";
import OrderedOrdersTab from "@/components/admin/logistics/OrderedOrdersTab";
import ArchiveTab from "@/components/admin/logistics/ArchiveTab";

export default function AdminLogistics() {
  return (
    <div className="md:px-8 px-4 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Logistyka Zamówień
        </h2>
        <p className="text-muted-foreground">
          Zarządzaj zamówieniami u producentów i dostawami do organizacji
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="pending">Oczekujące</TabsTrigger>
          <TabsTrigger value="ordered">Zamówione</TabsTrigger>
          <TabsTrigger value="archive">Archiwum</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <PendingOrdersTab />
        </TabsContent>
        
        <TabsContent value="ordered" className="mt-6">
          <OrderedOrdersTab />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <ArchiveTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
