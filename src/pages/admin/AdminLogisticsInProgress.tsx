import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Building2, 
  Package, 
  Calendar, 
  Factory, 
  ChevronDown, 
  FileText,
  Truck,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

interface ShipmentWithItems {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationAddress: string;
  organizationCity: string;
  organizationPostalCode: string;
  organizationPhone: string;
  producerId: string | null;
  producerName: string | null;
  status: string;
  trackingNumber: string | null;
  orderedAt: string | null;
  totalValue: number;
  items: {
    id: string;
    productName: string;
    quantity: number;
    animalName: string | null;
    unitPrice: number;
  }[];
}

export default function AdminLogisticsInProgress() {
  const [expandedShipments, setExpandedShipments] = useState<Set<string>>(new Set());
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["admin-logistics-in-progress"],
    queryFn: async () => {
      // Get shipments with status 'ordered' (placed but not yet shipped)
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          organization_id,
          producer_id,
          status,
          tracking_number,
          ordered_at,
          total_value,
          organizations (id, name, address, city, postal_code, contact_phone),
          producers (id, name)
        `)
        .eq('status', 'ordered')
        .order('ordered_at', { ascending: false });

      if (error) throw error;

      const result: ShipmentWithItems[] = [];

      for (const shipment of data || []) {
        // Get items for this shipment
        const { data: items } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            unit_price,
            products (name),
            animals (name)
          `)
          .eq('shipment_id', shipment.id);

        const org = shipment.organizations as any;
        const producer = shipment.producers as any;

        result.push({
          id: shipment.id,
          organizationId: org?.id || '',
          organizationName: org?.name || 'N/A',
          organizationAddress: org?.address || '',
          organizationCity: org?.city || '',
          organizationPostalCode: org?.postal_code || '',
          organizationPhone: org?.contact_phone || '',
          producerId: producer?.id || null,
          producerName: producer?.name || null,
          status: shipment.status,
          trackingNumber: shipment.tracking_number,
          orderedAt: shipment.ordered_at,
          totalValue: shipment.total_value || 0,
          items: (items || []).map((item: any) => ({
            id: item.id,
            productName: item.products?.name || 'N/A',
            quantity: item.quantity,
            animalName: item.animals?.name || null,
            unitPrice: item.unit_price,
          })),
        });
      }

      return result;
    },
  });

  const toggleExpanded = (id: string) => {
    setExpandedShipments(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddTracking = async (shipmentId: string) => {
    const trackingNumber = trackingNumbers[shipmentId];
    if (!trackingNumber?.trim()) {
      toast({
        title: "Błąd",
        description: "Podaj numer przesyłki",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(shipmentId);

      // Update shipment status to 'shipped' and add tracking number
      const { error } = await supabase
        .from('shipments')
        .update({
          status: 'shipped',
          tracking_number: trackingNumber.trim(),
          shipped_at: new Date().toISOString(),
        })
        .eq('id', shipmentId);

      if (error) throw error;

      // Update order items to 'shipped' status
      const { error: itemsError } = await supabase
        .from('order_items')
        .update({ fulfillment_status: 'shipped' })
        .eq('shipment_id', shipmentId);

      if (itemsError) throw itemsError;

      toast({
        title: "Przesyłka wysłana",
        description: "Numer przesyłki został dodany. Zamówienie przeniesione do sekcji Dostawy.",
      });

      setTrackingNumbers(prev => {
        const next = { ...prev };
        delete next[shipmentId];
        return next;
      });

      queryClient.invalidateQueries({ queryKey: ["admin-logistics-in-progress"] });
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować przesyłki",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const generateOrganizationPDF = (shipment: ShipmentWithItems) => {
    const doc = new jsPDF();
    
    // Group items by animal
    const itemsByAnimal = shipment.items.reduce((acc, item) => {
      const key = item.animalName || 'Dla organizacji';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof shipment.items>);

    // Header
    doc.setFontSize(18);
    doc.text('LISTA DLA ORGANIZACJI', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Organizacja: ${shipment.organizationName}`, 20, 35);
    doc.text(`Adres: ${shipment.organizationAddress}`, 20, 42);
    doc.text(`${shipment.organizationPostalCode} ${shipment.organizationCity}`, 20, 49);
    doc.text(`Telefon: ${shipment.organizationPhone}`, 20, 56);
    doc.text(`Data zamowienia: ${shipment.orderedAt ? format(new Date(shipment.orderedAt), "dd.MM.yyyy", { locale: pl }) : 'N/A'}`, 20, 63);
    
    doc.line(20, 70, 190, 70);
    
    let yPos = 80;
    doc.setFontSize(14);
    doc.text('PRODUKTY:', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    Object.entries(itemsByAnimal).forEach(([animalName, items]) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(`${animalName}:`, 20, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 7;
      
      items.forEach(item => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`  - ${item.productName} x${item.quantity}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    });

    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    doc.setFont(undefined, 'bold');
    doc.text(`Laczna ilosc produktow: ${shipment.items.reduce((sum, i) => sum + i.quantity, 0)}`, 20, yPos);

    doc.save(`lista_${shipment.organizationName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateProducerPDF = (shipment: ShipmentWithItems) => {
    const doc = new jsPDF();
    
    // Aggregate products by name
    const productQuantities = shipment.items.reduce((acc, item) => {
      if (!acc[item.productName]) acc[item.productName] = 0;
      acc[item.productName] += item.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Header
    doc.setFontSize(18);
    doc.text('ZAMOWIENIE DLA PRODUCENTA', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Producent: ${shipment.producerName || 'N/A'}`, 20, 35);
    doc.text(`Data zamowienia: ${shipment.orderedAt ? format(new Date(shipment.orderedAt), "dd.MM.yyyy", { locale: pl }) : 'N/A'}`, 20, 42);
    
    doc.setFontSize(14);
    doc.text('ADRES WYSYLKI:', 20, 55);
    doc.setFontSize(12);
    doc.text(shipment.organizationName, 20, 65);
    doc.text(shipment.organizationAddress, 20, 72);
    doc.text(`${shipment.organizationPostalCode} ${shipment.organizationCity}`, 20, 79);
    doc.text(`Tel: ${shipment.organizationPhone}`, 20, 86);
    
    doc.line(20, 95, 190, 95);
    
    doc.setFontSize(14);
    doc.text('PRODUKTY DO WYSYLKI:', 20, 105);
    
    let yPos = 115;
    doc.setFontSize(11);
    Object.entries(productQuantities).forEach(([name, qty]) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${name}: ${qty} szt.`, 20, yPos);
      yPos += 7;
    });

    doc.line(20, yPos + 5, 190, yPos + 5);
    yPos += 15;
    doc.setFont(undefined, 'bold');
    doc.text(`RAZEM: ${Object.values(productQuantities).reduce((a, b) => a + b, 0)} produktow`, 20, yPos);

    doc.save(`zamowienie_${shipment.producerName?.replace(/\s+/g, '_') || 'producent'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-2">W Realizacji</h2>
          <p className="text-muted-foreground">Ładowanie danych...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">W Realizacji</h2>
        <p className="text-muted-foreground">
          Zamówienia złożone u producentów, oczekujące na wysyłkę. Dodaj numer przesyłki aby przenieść do Dostaw.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{shipments.length}</p>
            <p className="text-xs text-muted-foreground">Oczekujących</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {shipments.reduce((sum, s) => sum + s.items.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Produktów</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipments list */}
      {shipments.length === 0 ? (
        <Card className="rounded-3xl shadow-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Brak zamówień w realizacji
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Zamówienia pojawią się tutaj po złożeniu ich w Centrum Zamówień.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment) => {
            const isExpanded = expandedShipments.has(shipment.id);

            return (
              <Collapsible key={shipment.id} open={isExpanded} onOpenChange={() => toggleExpanded(shipment.id)}>
                <Card className="rounded-3xl shadow-card border-border/50 overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <CardContent className="p-6 cursor-pointer hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-amber-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Factory className="h-4 w-4 text-accent" />
                              <span className="font-bold">{shipment.producerName || 'N/A'}</span>
                            </div>
                            <span className="text-muted-foreground">→</span>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              <span className="font-medium">{shipment.organizationName}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {shipment.orderedAt 
                                ? format(new Date(shipment.orderedAt), "dd.MM.yyyy", { locale: pl })
                                : 'N/A'}
                            </span>
                            <Badge variant="outline">
                              {shipment.items.length} produktów
                            </Badge>
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              Oczekuje na nadanie
                            </Badge>
                          </div>
                        </div>

                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-6 pb-6 border-t border-border/50 pt-4">
                      {/* Products list */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Produkty w zamówieniu:</h4>
                        <div className="grid gap-1">
                          {shipment.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm py-1 px-2 bg-muted/30 rounded">
                              <span>{item.productName}</span>
                              <div className="flex items-center gap-3">
                                {item.animalName && (
                                  <span className="text-muted-foreground text-xs">
                                    dla: {item.animalName}
                                  </span>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  x{item.quantity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateOrganizationPDF(shipment)}
                          className="rounded-2xl"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Lista dla organizacji
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateProducerPDF(shipment)}
                          className="rounded-2xl"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Zamówienie dla producenta
                        </Button>
                      </div>

                      {/* Tracking number input */}
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Numer przesyłki / list przewozowy"
                          value={trackingNumbers[shipment.id] || ''}
                          onChange={(e) => setTrackingNumbers(prev => ({
                            ...prev,
                            [shipment.id]: e.target.value
                          }))}
                          className="flex-1 rounded-2xl"
                        />
                        <Button
                          onClick={() => handleAddTracking(shipment.id)}
                          disabled={updating === shipment.id}
                          className="rounded-2xl"
                        >
                          {updating === shipment.id ? (
                            "Zapisywanie..."
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Wyślij
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}
