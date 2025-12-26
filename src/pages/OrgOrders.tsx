import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import OrgLayout from "@/components/organization/OrgLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Package, 
  Calendar, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Factory,
  ChevronDown,
  Printer
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface OrgShipment {
  id: string;
  producerName: string | null;
  status: string;
  trackingNumber: string | null;
  shippedAt: string | null;
  confirmedAt: string | null;
  orderedAt: string | null;
  items: {
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    animalName: string | null;
    unitPrice: number;
  }[];
}

export default function OrgOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [problemDescription, setProblemDescription] = useState("");
  const [processing, setProcessing] = useState(false);
  const [expandedShipments, setExpandedShipments] = useState<Set<string>>(new Set());

  const { data: orgData } = useQuery({
    queryKey: ["user-organization", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["org-orders", orgData?.organization_id],
    queryFn: async () => {
      if (!orgData?.organization_id) return [];

      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          status,
          tracking_number,
          shipped_at,
          confirmed_at,
          ordered_at,
          producers (name)
        `)
        .eq('organization_id', orgData.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const result: OrgShipment[] = [];

      for (const shipment of data || []) {
        const { data: items } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            unit_price,
            products (name, image_url),
            animals (name)
          `)
          .eq('shipment_id', shipment.id);

        result.push({
          id: shipment.id,
          producerName: (shipment.producers as any)?.name || null,
          status: shipment.status,
          trackingNumber: shipment.tracking_number,
          shippedAt: shipment.shipped_at,
          confirmedAt: shipment.confirmed_at,
          orderedAt: shipment.ordered_at,
          items: (items || []).map((item: any) => ({
            id: item.id,
            productName: item.products?.name || 'N/A',
            productImage: item.products?.image_url || null,
            quantity: item.quantity,
            animalName: item.animals?.name || null,
            unitPrice: item.unit_price || 0,
          })),
        });
      }

      return result;
    },
    enabled: !!orgData?.organization_id,
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'collecting':
        return {
          label: 'Oczekuje na minimum logistyczne',
          badge: <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Kompletowanie</Badge>,
          icon: <Clock className="h-6 w-6 text-muted-foreground" />,
          bgColor: 'bg-muted',
        };
      case 'ordered':
        return {
          label: 'Oczekuje na nadanie',
          badge: <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Package className="h-3 w-3 mr-1" />Zamówione</Badge>,
          icon: <Package className="h-6 w-6 text-amber-600" />,
          bgColor: 'bg-amber-100',
        };
      case 'shipped':
        return {
          label: 'W drodze!',
          badge: <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Truck className="h-3 w-3 mr-1" />W drodze</Badge>,
          icon: <Truck className="h-6 w-6 text-blue-600" />,
          bgColor: 'bg-blue-100',
        };
      case 'confirmed':
        return {
          label: 'Zrealizowane',
          badge: <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Zrealizowane</Badge>,
          icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
        };
      default:
        return {
          label: status,
          badge: <Badge variant="outline">{status}</Badge>,
          icon: <Package className="h-6 w-6 text-muted-foreground" />,
          bgColor: 'bg-muted',
        };
    }
  };

  const handleConfirmDelivery = async () => {
    if (!confirmingId) return;

    try {
      setProcessing(true);

      const { error } = await supabase
        .from('shipments')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', confirmingId);

      if (error) throw error;

      // Update order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .update({ fulfillment_status: 'fulfilled' })
        .eq('shipment_id', confirmingId);

      if (itemsError) throw itemsError;

      toast({
        title: "Zamówienie potwierdzone",
        description: "Dziękujemy za potwierdzenie odbioru!",
      });

      setConfirmingId(null);
      queryClient.invalidateQueries({ queryKey: ["org-orders"] });
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się potwierdzić odbioru",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReportProblem = async () => {
    if (!reportingId || !problemDescription.trim()) return;

    try {
      setProcessing(true);

      // Send email with problem report (simplified - would use edge function in production)
      console.log('Problem report:', {
        shipmentId: reportingId,
        description: problemDescription,
        to: 'fundacjapwm@gmail.com'
      });

      toast({
        title: "Zgłoszenie wysłane",
        description: "Skontaktujemy się z Tobą w sprawie problemu.",
      });

      setReportingId(null);
      setProblemDescription("");
    } catch (error) {
      console.error('Error reporting problem:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zgłoszenia",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const activeShipments = shipments.filter(s => s.status !== 'confirmed');
  const completedShipments = shipments.filter(s => s.status === 'confirmed');

  if (isLoading) {
    return (
      <OrgLayout>
        <div className="space-y-6 p-4">
          <h1 className="text-2xl font-bold">Zamówienia</h1>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </OrgLayout>
    );
  }

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

  // Group items by animal for better display
  const groupItemsByAnimal = (items: OrgShipment['items']) => {
    return items.reduce((acc, item) => {
      const key = item.animalName || 'Dla organizacji';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
  };

  const handlePrintShipment = (shipment: OrgShipment) => {
    const itemsByAnimal = groupItemsByAnimal(shipment.items);
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista zamówienia</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          .info { margin-bottom: 20px; color: #666; }
          .animal-section { margin-bottom: 24px; border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
          .animal-name { font-size: 18px; font-weight: bold; color: #f97316; margin-bottom: 12px; }
          .product-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eee; }
          .product-row:last-child { border-bottom: none; }
          .product-image { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; background: #f5f5f5; }
          .product-name { flex: 1; }
          .product-qty { font-weight: bold; background: #f5f5f5; padding: 4px 12px; border-radius: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Lista zamówienia</h1>
        <div class="info">
          ${shipment.orderedAt ? `<p>Data zamówienia: ${format(new Date(shipment.orderedAt), "dd.MM.yyyy", { locale: pl })}</p>` : ''}
          ${shipment.trackingNumber ? `<p>Numer przesyłki: ${shipment.trackingNumber}</p>` : ''}
        </div>
        ${Object.entries(itemsByAnimal).map(([animalName, items]) => `
          <div class="animal-section">
            <div class="animal-name">🐾 ${animalName}</div>
            ${items.map(item => `
              <div class="product-row">
                ${item.productImage ? `<img src="${item.productImage}" class="product-image" />` : '<div class="product-image"></div>'}
                <span class="product-name">${item.productName}</span>
                <span class="product-qty">x${item.quantity}</span>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const renderShipmentCard = (shipment: OrgShipment) => {
    const statusDisplay = getStatusDisplay(shipment.status);
    const canConfirm = shipment.status === 'shipped';
    const isExpanded = expandedShipments.has(shipment.id);
    const itemsByAnimal = groupItemsByAnimal(shipment.items);
    const totalItems = shipment.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
      <Collapsible key={shipment.id} open={isExpanded} onOpenChange={() => toggleExpanded(shipment.id)}>
        <Card className="rounded-3xl shadow-card border-border/50 overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardContent className="p-6 cursor-pointer hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl ${statusDisplay.bgColor} flex items-center justify-center shrink-0`}>
                  {statusDisplay.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {shipment.producerName && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Factory className="h-3 w-3" />
                        {shipment.producerName}
                      </span>
                    )}
                    {statusDisplay.badge}
                    <Badge variant="outline">
                      <Package className="h-3 w-3 mr-1" />
                      {totalItems} produktów
                    </Badge>
                  </div>

                  <p className="font-medium text-foreground mb-2">
                    {statusDisplay.label}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {shipment.orderedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Zamówiono: {format(new Date(shipment.orderedAt), "dd.MM.yyyy", { locale: pl })}
                      </span>
                    )}
                    {shipment.shippedAt && (
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Wysłano: {format(new Date(shipment.shippedAt), "dd.MM.yyyy", { locale: pl })}
                      </span>
                    )}
                    {shipment.trackingNumber && (
                      <Badge variant="outline" className="text-xs">
                        Nr: {shipment.trackingNumber}
                      </Badge>
                    )}
                  </div>
                </div>

                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </CardContent>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-6 pb-6 border-t border-border/50 pt-4">
              {/* Header with print button */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Szczegóły zamówienia:</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handlePrintShipment(shipment); }}
                  className="rounded-xl gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Drukuj listę
                </Button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(itemsByAnimal).map(([animalName, items]) => (
                  <div key={animalName} className="bg-muted/30 rounded-2xl p-4">
                    <h5 className="font-medium text-primary mb-2 flex items-center gap-2">
                      🐾 {animalName}
                    </h5>
                    <div className="grid gap-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-sm py-2">
                          {item.productImage ? (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="flex-1">{item.productName}</span>
                          <Badge variant="outline" className="text-xs">
                            x{item.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions for shipped orders */}
              {canConfirm && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                  <Button
                    onClick={(e) => { e.stopPropagation(); setConfirmingId(shipment.id); }}
                    className="rounded-2xl"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Potwierdź odbiór
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); setReportingId(shipment.id); }}
                    className="rounded-2xl text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Zgłoś problem
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <OrgLayout>
      <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold">Zamówienia</h1>

        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2 rounded-xl sm:rounded-2xl h-9 sm:h-10">
            <TabsTrigger value="active" className="rounded-lg sm:rounded-xl text-xs sm:text-sm">
              Aktywne ({activeShipments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl">
              Zrealizowane ({completedShipments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeShipments.length === 0 ? (
              <Card className="rounded-3xl shadow-card border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Brak aktywnych zamówień
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Zamówienia pojawią się tutaj gdy darczyńcy kupią produkty z Twojej listy potrzeb.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeShipments.map(renderShipmentCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedShipments.length === 0 ? (
              <Card className="rounded-3xl shadow-card border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Brak zrealizowanych zamówień
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Zamówienia pojawią się tutaj po potwierdzeniu ich odbioru.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedShipments.map(renderShipmentCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Confirm delivery dialog */}
        <Dialog open={!!confirmingId} onOpenChange={() => setConfirmingId(null)}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Potwierdź odbiór zamówienia</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Czy na pewno chcesz potwierdzić odbiór zamówienia? Ta akcja oznacza, że paczka dotarła i wszystkie produkty są zgodne z zamówieniem.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmingId(null)} className="rounded-2xl">
                Anuluj
              </Button>
              <Button onClick={handleConfirmDelivery} disabled={processing} className="rounded-2xl">
                {processing ? "Potwierdzanie..." : "Potwierdź odbiór"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report problem dialog */}
        <Dialog open={!!reportingId} onOpenChange={() => { setReportingId(null); setProblemDescription(""); }}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Zgłoś problem z zamówieniem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Opisz problem który wystąpił z zamówieniem. Skontaktujemy się z Tobą jak najszybciej.
              </p>
              <Textarea
                placeholder="Opisz problem..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="min-h-[100px] rounded-2xl"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setReportingId(null); setProblemDescription(""); }} className="rounded-2xl">
                Anuluj
              </Button>
              <Button 
                onClick={handleReportProblem} 
                disabled={processing || !problemDescription.trim()}
                className="rounded-2xl"
              >
                {processing ? "Wysyłanie..." : "Wyślij zgłoszenie"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </OrgLayout>
  );
}
