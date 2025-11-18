import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, ArrowLeft, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  image_url?: string;
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
  const [uploadingImage, setUploadingImage] = useState(false);

  const [newProducer, setNewProducer] = useState({
    name: '', contact_email: '', contact_phone: '', description: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', unit: 'szt', category_id: '', description: '', weight_volume: '', producer_id: '', image_url: ''
  });

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Błąd podczas przesyłania zdjęcia');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProducer = async () => {
    await onCreateProducer(newProducer);
    setNewProducer({ name: '', contact_email: '', contact_phone: '', description: '' });
  };

  const handleCreateProduct = async () => {
    if (!newProduct.image_url) {
      toast.error('Zdjęcie produktu jest wymagane');
      return;
    }
    await onCreateProduct({ ...newProduct, producer_id: selectedProducerId });
    setNewProduct({ name: '', price: '', unit: 'szt', category_id: '', description: '', weight_volume: '', producer_id: '', image_url: '' });
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
            <div>
              <Label>Zdjęcie produktu *</Label>
              <div className="flex items-center gap-4">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleImageUpload(file);
                      if (url) setNewProduct({ ...newProduct, image_url: url });
                    }
                  }}
                  disabled={uploadingImage}
                />
                {newProduct.image_url && (
                  <img src={newProduct.image_url} alt="Preview" className="h-16 w-16 object-cover rounded" />
                )}
              </div>
            </div>
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
                  <div className="flex items-center gap-4">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.price} zł / {product.unit}</p>
                    </div>
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
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Dodaj producenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={newProducer.name} onChange={(e) => setNewProducer({ ...newProducer, name: e.target.value })} placeholder="Nazwa producenta" />
            <Button onClick={handleCreateProducer} className="w-full">
              Dodaj producenta
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Szybkie dodawanie produktu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Producent</Label>
              <Select 
                value={newProduct.producer_id || ''} 
                onValueChange={(value) => setNewProduct({ ...newProduct, producer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz producenta" />
                </SelectTrigger>
                <SelectContent>
                  {producers.filter(p => p.active).map((producer) => (
                    <SelectItem key={producer.id} value={producer.id}>{producer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Zdjęcie *</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleImageUpload(file);
                      if (url) setNewProduct({ ...newProduct, image_url: url });
                    }
                  }}
                  disabled={uploadingImage}
                  className="flex-1"
                />
                {newProduct.image_url && (
                  <img src={newProduct.image_url} alt="Preview" className="h-12 w-12 object-cover rounded" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Nazwa</Label>
                <Input 
                  value={newProduct.name} 
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                  placeholder="Produkt"
                />
              </div>
              <div>
                <Label>Cena</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={newProduct.price} 
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} 
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button 
              onClick={async () => {
                if (!newProduct.producer_id) {
                  return;
                }
                if (!newProduct.image_url) {
                  toast.error('Zdjęcie produktu jest wymagane');
                  return;
                }
                await onCreateProduct({ 
                  ...newProduct, 
                  producer_id: newProduct.producer_id 
                });
                setNewProduct({ name: '', price: '', unit: 'szt', category_id: '', description: '', weight_volume: '', producer_id: '', image_url: '' });
              }} 
              className="w-full"
              disabled={!newProduct.producer_id || !newProduct.name || !newProduct.price || !newProduct.image_url || uploadingImage}
            >
              Dodaj produkt
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Producenci ({producers.length})</CardTitle>
          <CardDescription>Kliknij na producenta, aby zobaczyć i zarządzać jego produktami</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {producers.map((producer) => {
              const productCount = products.filter(p => p.producer_id === producer.id).length;
              return (
                <Card 
                  key={producer.id} 
                  className="cursor-pointer hover:border-primary transition-colors" 
                  onClick={() => setSelectedProducerId(producer.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{producer.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {productCount} {productCount === 1 ? 'produkt' : productCount < 5 ? 'produkty' : 'produktów'}
                        </p>
                      </div>
                      <Badge variant={producer.active ? 'default' : 'secondary'}>
                        {producer.active ? 'Aktywny' : 'Nieaktywny'}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
