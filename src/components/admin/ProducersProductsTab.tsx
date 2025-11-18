import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface Producer {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  description?: string;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  producer_id: string;
  category_id: string;
  description?: string;
  weight_volume?: string;
  product_categories?: { name: string };
}

interface ProductCategory {
  id: string;
  name: string;
}

interface Props {
  producers: Producer[];
  products: Product[];
  productCategories: ProductCategory[];
  onCreateProducer: (data: any) => Promise<void>;
  onUpdateProducer: (data: any) => Promise<void>;
  onDeleteProducer: (id: string) => Promise<void>;
  onCreateProduct: (data: any) => Promise<void>;
  onUpdateProduct: (data: any) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export default function ProducersProductsTab({
  producers,
  products,
  productCategories,
  onCreateProducer,
  onUpdateProducer,
  onDeleteProducer,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
}: Props) {
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProducer, setNewProducer] = useState({
    name: '', contact_email: '', contact_phone: '', description: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', unit: 'szt', category_id: '', description: '', weight_volume: ''
  });

  const handleCreateProducer = async () => {
    await onCreateProducer(newProducer);
    setNewProducer({ name: '', contact_email: '', contact_phone: '', description: '' });
  };

  const handleCreateProduct = async () => {
    await onCreateProduct({ ...newProduct, producer_id: selectedProducerId });
    setNewProduct({ name: '', price: '', unit: 'szt', category_id: '', description: '', weight_volume: '' });
  };

  if (selectedProducerId) {
    const producer = producers.find(p => p.id === selectedProducerId);
    const producerProducts = products.filter(p => p.producer_id === selectedProducerId);

    return (
      <div className="grid gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedProducerId(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do producentów
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{producer?.name}</h2>
            <p className="text-muted-foreground">Produkty producenta</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Dodaj nowy produkt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nazwa produktu</Label>
                <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div>
                <Label>Cena</Label>
                <Input type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Jednostka</Label>
                <Select value={newProduct.unit} onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="szt">Sztuka</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="l">Litr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kategoria</Label>
                <Select value={newProduct.category_id} onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}>
                  <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Waga/Objętość</Label>
                <Input value={newProduct.weight_volume} onChange={(e) => setNewProduct({ ...newProduct, weight_volume: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleCreateProduct}>Dodaj produkt</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produkty ({producerProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {producerProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.price} zł / {product.unit}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => onDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Dodaj nowego producenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={newProducer.name} onChange={(e) => setNewProducer({ ...newProducer, name: e.target.value })} placeholder="Nazwa" />
          <Button onClick={handleCreateProducer}>
            Dodaj producenta
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Producenci ({producers.length})</CardTitle>
          <CardDescription>Kliknij na producenta, aby zobaczyć produkty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {producers.map((producer) => (
              <Card key={producer.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedProducerId(producer.id)}>
                <CardHeader>
                  <CardTitle className="text-lg">{producer.name}</CardTitle>
                  <Badge variant={producer.active ? 'default' : 'secondary'}>{producer.active ? 'Aktywny' : 'Nieaktywny'}</Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
