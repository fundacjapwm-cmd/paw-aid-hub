import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Clock, Building2, PawPrint } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  product_id: string;
  products?: {
    id: string;
    name: string;
    image_url?: string;
    producer_id?: string;
    producers?: {
      name: string;
    };
  };
  animals?: {
    id: string;
    name: string;
    species: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  user_id: string;
  order_items: OrderItem[];
}

interface BatchOrder {
  id: string;
  organization_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  tracking_number?: string;
  notes?: string;
  organizations?: {
    name: string;
    logo_url?: string;
  };
  orders?: Order[];
}

export default function AdminOrdersCollecting() {
  const [selectedBatch, setSelectedBatch] = useState<BatchOrder | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: batchOrders, refetch } = useQuery({
    queryKey: ["admin-batch-orders-collecting"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_batch_orders")
        .select(`
          *,
          organizations(name, logo_url)
        `)
        .eq("status", "collecting")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const batchesWithOrders = await Promise.all(
        (data || []).map(async (batch) => {
          const { data: orders } = await supabase
            .from("orders")
            .select(`
              *,
              order_items(
                *,
                products(id, name, image_url, producer_id, producers(name)),
                animals(id, name, species)
              )
            `)
            .eq("batch_order_id", batch.id)
            .eq("payment_status", "completed")
            .order("created_at", { ascending: false });

          return {
            ...batch,
            orders: orders || [],
          };
        })
      );

      return batchesWithOrders as BatchOrder[];
    },
  });

  const collectingOrders = batchOrders || [];

  const handleStartProcessing = (batch: BatchOrder) => {
    setSelectedBatch(batch);
    setShowProcessDialog(true);
  };

  const handleProcessOrder = async () => {
    if (!selectedBatch) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("organization_batch_orders")
        .update({
          status: "processing",
          processed_at: new Date().toISOString(),
          notes: notes,
        })
        .eq("id", selectedBatch.id);

      if (error) throw error;

      toast.success("Zamówienie przeniesione do realizacji");
      setShowProcessDialog(false);
      setSelectedBatch(null);
      setNotes("");
      refetch();
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generateProducerOrder = (batch: BatchOrder) => {
    const allItems: OrderItem[] = [];
    batch.orders?.forEach((order) => {
      order.order_items.forEach((item) => {
        allItems.push(item);
      });
    });

    const producerOrder = new Map<string, {
      product: OrderItem["products"];
      totalQuantity: number;
      totalValue: number;
    }>();

    allItems.forEach((item) => {
      if (!item.products) return;
      
      const productId = item.products.id;
      if (producerOrder.has(productId)) {
        const existing = producerOrder.get(productId)!;
        existing.totalQuantity += item.quantity;
        existing.totalValue += item.quantity * item.unit_price;
      } else {
        producerOrder.set(productId, {
          product: item.products,
          totalQuantity: item.quantity,
          totalValue: item.quantity * item.unit_price,
        });
      }
    });

    return Array.from(producerOrder.values());
  };

  const renderBatchOrder = (batch: BatchOrder) => {
    const itemsByTarget = new Map<string, OrderItem[]>();
    const orgItems: OrderItem[] = [];

    batch.orders?.forEach((order) => {
      order.order_items.forEach((item) => {
        if (item.animals) {
          const key = `animal-${item.animals.id}`;
          if (!itemsByTarget.has(key)) {
            itemsByTarget.set(key, []);
          }
          itemsByTarget.get(key)!.push(item);
        } else {
          orgItems.push(item);
        }
      });
    });

    const totalAmount = batch.orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalItems = batch.orders?.reduce(
      (sum, order) => sum + order.order_items.reduce((s, item) => s + item.quantity, 0),
      0
    ) || 0;

    return (
      <Card key={batch.id} className="rounded-3xl shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {batch.organizations?.logo_url && (
                <img
                  src={batch.organizations.logo_url}
                  alt={batch.organizations?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <CardTitle className="text-lg mb-1">
                  {batch.organizations?.name}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Zamówienie #{batch.id.slice(0, 8)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>{format(new Date(batch.created_at), "dd.MM.yyyy HH:mm", { locale: pl })}</span>
                  <span>{totalItems} produktów</span>
                  <span className="font-semibold text-primary">{totalAmount.toFixed(2)} zł</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary">Kompletowanie</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Items */}
          {orgItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Dla fundacji:
              </h4>
              <div className="space-y-2">
                {orgItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl"
                  >
                    {item.products?.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.products?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} szt. × {item.unit_price.toFixed(2)} zł
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items by Animal */}
          {Array.from(itemsByTarget.entries()).map(([key, items]) => {
            const animal = items[0].animals;
            return (
              <div key={key} className="space-y-3">
                <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  Dla {animal?.name} ({animal?.species}):
                </h4>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl"
                    >
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.products?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} szt. × {item.unit_price.toFixed(2)} zł
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Producer Order Summary */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-3">Zamówienie zbiorcze do producenta:</h4>
            <div className="space-y-2 bg-muted/20 p-4 rounded-2xl">
              {generateProducerOrder(batch).map((item) => (
                <div key={item.product?.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.product?.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.product?.producers?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.totalQuantity} szt.</p>
                    <p className="text-xs text-muted-foreground">
                      {item.totalValue.toFixed(2)} zł
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => handleStartProcessing(batch)}
              className="flex-1 rounded-2xl"
            >
              <Package className="h-4 w-4 mr-2" />
              Realizacja
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="md:px-8 px-4 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-6 border border-border/50 shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-2">Kompletowane</h2>
        <p className="text-muted-foreground">
          Otwarte zamówienia oczekujące na skompletowanie wg organizacji
        </p>
      </div>

      {collectingOrders.length === 0 ? (
        <Card className="rounded-3xl p-12 text-center shadow-card">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Brak zamówień w kompletowaniu</h3>
          <p className="text-muted-foreground">
            Zamówienia od darczyńców pojawią się tutaj
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {collectingOrders.map((batch) => renderBatchOrder(batch))}
        </div>
      )}

      {/* Process Order Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rozpocznij realizację zamówienia</DialogTitle>
            <DialogDescription>
              Zamówienie zostanie przekazane do realizacji. Wygeneruj zamówienie do producenta.
            </DialogDescription>
          </DialogHeader>

          {selectedBatch && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-2xl">
                <h4 className="font-semibold mb-3">Zamówienie zbiorcze:</h4>
                {generateProducerOrder(selectedBatch).map((item) => (
                  <div key={item.product?.id} className="flex justify-between text-sm py-1">
                    <span>{item.product?.name}</span>
                    <span className="font-semibold">{item.totalQuantity} szt.</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notatki (opcjonalnie)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dodatkowe informacje..."
                  className="rounded-2xl"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProcessDialog(false)}
              className="rounded-2xl"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleProcessOrder}
              disabled={submitting}
              className="rounded-2xl"
            >
              {submitting ? "Przetwarzanie..." : "Rozpocznij realizację"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
