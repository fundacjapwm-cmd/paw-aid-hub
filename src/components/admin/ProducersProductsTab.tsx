import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Trash2, ArrowLeft, Image, Upload, X, Check, ChevronsUpDown, EyeOff, Mail, Phone, Building2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { producerSchema } from '@/lib/validations/producer';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import ProductEditDialog from './ProductEditDialog';

interface Producer {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  description?: string;
  logo_url?: string;
  nip?: string;
  notes?: string;
  active: boolean;
}


interface Product {
  id: string;
  name: string;
  price: number;
  purchase_price?: number;
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
  const [producerSearchOpen, setProducerSearchOpen] = useState(false);
  const [producerSearchValue, setProducerSearchValue] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Clear product search when producer changes
  useEffect(() => {
    setProductSearchQuery('');
  }, [selectedProducerId]);

  const [newProducer, setNewProducer] = useState({
    name: '', contact_email: '', contact_phone: '', description: '', logo_url: '', nip: '', notes: '', active: true
  });

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', purchase_price: '', unit: 'szt', category_id: '', description: '', weight_volume: '', producer_id: '', image_url: ''
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
    // Validate using zod schema
    try {
      producerSchema.parse(newProducer);
      await onCreateProducer(newProducer);
      setNewProducer({ name: '', contact_email: '', contact_phone: '', description: '', logo_url: '', nip: '', notes: '', active: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Błąd podczas dodawania producenta');
      }
    }
  };

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Błąd podczas przesyłania logo');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.image_url) {
      toast.error('Zdjęcie produktu jest wymagane');
      return;
    }
    await onCreateProduct({ 
      ...newProduct, 
      producer_id: selectedProducerId,
      purchase_price: newProduct.purchase_price ? parseFloat(newProduct.purchase_price) : undefined
    });
    setNewProduct({ name: '', price: '', purchase_price: '', unit: 'szt', category_id: '', description: '', weight_volume: '', producer_id: '', image_url: '' });
  };

  if (selectedProducerId) {
    const producer = producers.find(p => p.id === selectedProducerId);
    const producerProducts = products.filter(p => p.producer_id === selectedProducerId);

    // Filter products based on search query (minimum 3 characters)
    const filteredProducts = productSearchQuery.length >= 3
      ? producerProducts.filter(p => 
          p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
        )
      : producerProducts;

    const handleBackToProducers = () => {
      setSelectedProducerId(null);
      setProductSearchQuery('');
    };

    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={handleBackToProducers}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do listy producentów
        </Button>

        {/* Producer Hero Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-6">
              {/* Logo */}
              {producer?.logo_url ? (
                <div className="flex-shrink-0">
                  <img 
                    src={producer.logo_url} 
                    alt={`${producer.name} logo`}
                    className="h-24 w-24 object-contain border rounded-lg p-2"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 h-24 w-24 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              
              {/* Producer Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{producer?.name}</h2>
                  {producer?.nip && (
                    <p className="text-sm text-muted-foreground">NIP: {producer.nip}</p>
                  )}
                </div>
                
                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-3">
                  {producer?.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{producer.contact_email}</span>
                    </div>
                  )}
                  {producer?.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{producer.contact_phone}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {producer?.description && (
                  <p className="text-sm text-muted-foreground">{producer.description}</p>
                )}

                {/* Internal Notes */}
                {producer?.notes && (
                  <div className="bg-muted/50 rounded-lg p-3 border border-dashed">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Notatki wewnętrzne</p>
                        <p className="text-sm">{producer.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produkty - {producer?.name}</CardTitle>
            <CardDescription>Dodaj nowy produkt dla tego producenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Zdjęcie, nazwa i cena w jednym rzędzie */}
            <div className="flex gap-3">
              {/* Zdjęcie produktu */}
              <div className="flex-shrink-0">
                <Label>Zdjęcie *</Label>
                <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-20 w-20 flex items-center justify-center hover:border-primary/50 transition-colors mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleImageUpload(file);
                        if (url) setNewProduct({ ...newProduct, image_url: url });
                      }
                    }}
                    disabled={uploadingImage}
                  />
                  {newProduct.image_url ? (
                    <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Nazwa i Ceny obok zdjęcia */}
              <div className="flex-1 space-y-2">
                <div>
                  <Label>Nazwa produktu *</Label>
                  <Input 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                    placeholder="np. Karma dla psa"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Cena zakupu</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={newProduct.purchase_price} 
                      onChange={(e) => setNewProduct({ ...newProduct, purchase_price: e.target.value })} 
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cena sprzedaży *</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={newProduct.price} 
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} 
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>
                {newProduct.purchase_price && newProduct.price && parseFloat(newProduct.price) > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Marża: {(((parseFloat(newProduct.price) - parseFloat(newProduct.purchase_price)) / parseFloat(newProduct.price)) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* Jednostka, Kategoria, Waga w jednej linii */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Jednostka</Label>
                <Select value={newProduct.unit} onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Waga/Objętość</Label>
                <Input 
                  value={newProduct.weight_volume} 
                  onChange={(e) => setNewProduct({ ...newProduct, weight_volume: e.target.value })} 
                  placeholder="2kg, 500ml"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Opis */}
            <div>
              <Label>Opis produktu</Label>
              <Textarea 
                value={newProduct.description} 
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
                placeholder="Szczegółowy opis produktu..."
                rows={3}
                className="mt-1"
              />
            </div>

            <Button onClick={handleCreateProduct} disabled={uploadingImage} className="w-full">
              {uploadingImage ? 'Przesyłanie...' : 'Dodaj produkt'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produkty ({producerProducts.length})</CardTitle>
                {productSearchQuery.length >= 3 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Znaleziono: {filteredProducts.length}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Szukaj produktu (min. 3 znaki)..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="w-full"
              />
              {productSearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setProductSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {productSearchQuery.length >= 3 
                  ? 'Nie znaleziono produktów' 
                  : 'Brak produktów'
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Sprzedaż: {product.price} zł / {product.unit}</span>
                        {product.purchase_price && (
                          <>
                            <span>Zakup: {product.purchase_price} zł</span>
                            <span className="text-primary font-medium">
                              Marża: {(((product.price - product.purchase_price) / product.price) * 100).toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => onDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ProductEditDialog
          product={editingProduct}
          productCategories={productCategories}
          onClose={() => setEditingProduct(null)}
          onUpdate={onUpdateProduct}
        />
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
            <CardDescription>Uzupełnij dane nowego producenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Logo i podstawowe dane w jednym rzędzie */}
            <div className="flex gap-4">
              {/* Logo Upload */}
              <div className="space-y-2 flex-shrink-0">
                <Label>Logo</Label>
                <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-20 w-20 flex items-center justify-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleLogoUpload(file);
                        if (url) setNewProducer({ ...newProducer, logo_url: url });
                      }
                    }}
                    disabled={uploadingImage}
                  />
                  {newProducer.logo_url ? (
                    <img src={newProducer.logo_url} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Nazwa i NIP obok logo */}
              <div className="flex-1 space-y-2">
                <div>
                  <Label htmlFor="producer-name">Nazwa producenta *</Label>
                  <Input 
                    id="producer-name"
                    value={newProducer.name} 
                    onChange={(e) => setNewProducer({ ...newProducer, name: e.target.value })} 
                    placeholder="np. Brit Care, Royal Canin"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="producer-nip">NIP</Label>
                  <Input 
                    id="producer-nip"
                    value={newProducer.nip} 
                    onChange={(e) => setNewProducer({ ...newProducer, nip: e.target.value })} 
                    placeholder="10 cyfr"
                    maxLength={10}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Email i Telefon w jednej linii */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="producer-email">Email kontaktowy</Label>
                <Input 
                  id="producer-email"
                  type="email"
                  value={newProducer.contact_email} 
                  onChange={(e) => setNewProducer({ ...newProducer, contact_email: e.target.value })} 
                  placeholder="kontakt@firma.pl"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="producer-phone">Telefon</Label>
                <Input 
                  id="producer-phone"
                  type="tel"
                  value={newProducer.contact_phone} 
                  onChange={(e) => setNewProducer({ ...newProducer, contact_phone: e.target.value })} 
                  placeholder="+48 123 456 789"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Opis - jedno pod drugim */}
            <div>
              <Label htmlFor="producer-description">Opis</Label>
              <Textarea 
                id="producer-description"
                value={newProducer.description} 
                onChange={(e) => setNewProducer({ ...newProducer, description: e.target.value })} 
                placeholder="Krótki opis producenta..."
                rows={1}
                className="mt-1 resize-none"
              />
            </div>

            {/* Notatka wewnętrzna */}
            <div>
              <Label htmlFor="producer-notes">Notatka wewnętrzna</Label>
              <Textarea 
                id="producer-notes"
                value={newProducer.notes} 
                onChange={(e) => setNewProducer({ ...newProducer, notes: e.target.value })} 
                placeholder="Notatki dla administratorów..."
                rows={1}
                className="mt-1 resize-none"
              />
            </div>

            {/* Widoczność - kompaktowo */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Switch 
                id="producer-hidden"
                checked={!newProducer.active} 
                onCheckedChange={(checked) => setNewProducer({ ...newProducer, active: !checked })}
              />
              <div className="flex-1">
                <Label htmlFor="producer-hidden" className="cursor-pointer text-sm font-medium">
                  Ukryj dla organizacji
                </Label>
                <p className="text-xs text-muted-foreground">
                  Gdy zaznaczone, producent nie będzie widoczny dla organizacji
                </p>
              </div>
            </div>

            <Button onClick={handleCreateProducer} className="w-full" disabled={uploadingImage}>
              {uploadingImage ? 'Przesyłanie...' : 'Dodaj producenta'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Szybkie dodawanie produktu
            </CardTitle>
            <CardDescription>Dodaj produkt przypisując go do producenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Producer Search Combobox */}
            <div>
              <Label>Producent *</Label>
              <Popover open={producerSearchOpen} onOpenChange={setProducerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={producerSearchOpen}
                    className="w-full justify-between mt-1"
                  >
                    {newProduct.producer_id
                      ? producers.find((p) => p.id === newProduct.producer_id)?.name
                      : "Wpisz minimum 3 litery..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Szukaj producenta..." 
                      value={producerSearchValue}
                      onValueChange={setProducerSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>Nie znaleziono producenta.</CommandEmpty>
                      <CommandGroup>
                        {producers
                          .filter(p => 
                            p.active && 
                            (producerSearchValue.length < 3 || 
                             p.name.toLowerCase().includes(producerSearchValue.toLowerCase()))
                          )
                          .map((producer) => (
                            <CommandItem
                              key={producer.id}
                              value={producer.name}
                              onSelect={() => {
                                setNewProduct({ ...newProduct, producer_id: producer.id });
                                setProducerSearchOpen(false);
                                setProducerSearchValue('');
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newProduct.producer_id === producer.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {producer.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Zdjęcie, nazwa i cena w jednym rzędzie */}
            <div className="flex gap-3">
              {/* Zdjęcie produktu */}
              <div className="flex-shrink-0">
                <Label>Zdjęcie *</Label>
                <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-20 w-20 flex items-center justify-center hover:border-primary/50 transition-colors mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleImageUpload(file);
                        if (url) setNewProduct({ ...newProduct, image_url: url });
                      }
                    }}
                    disabled={uploadingImage}
                  />
                  {newProduct.image_url ? (
                    <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Nazwa i Ceny obok zdjęcia */}
              <div className="flex-1 space-y-2">
                <div>
                  <Label>Nazwa produktu *</Label>
                  <Input 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                    placeholder="np. Karma dla psa"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Cena zakupu</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={newProduct.purchase_price} 
                      onChange={(e) => setNewProduct({ ...newProduct, purchase_price: e.target.value })} 
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cena sprzedaży *</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={newProduct.price} 
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} 
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>
                {newProduct.purchase_price && newProduct.price && parseFloat(newProduct.price) > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Marża: {(((parseFloat(newProduct.price) - parseFloat(newProduct.purchase_price)) / parseFloat(newProduct.price)) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* Jednostka, Kategoria, Waga w jednej linii */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Jednostka</Label>
                <Select 
                  value={newProduct.unit} 
                  onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="szt">Sztuka</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="l">Litr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kategoria</Label>
                <Select 
                  value={newProduct.category_id} 
                  onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Wybierz" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Waga/Objętość</Label>
                <Input 
                  value={newProduct.weight_volume} 
                  onChange={(e) => setNewProduct({ ...newProduct, weight_volume: e.target.value })} 
                  placeholder="2kg, 500ml"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Opis */}
            <div>
              <Label>Opis produktu</Label>
              <Textarea 
                value={newProduct.description} 
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
                placeholder="Szczegółowy opis produktu..."
                rows={3}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={async () => {
                if (!newProduct.producer_id) {
                  toast.error('Wybierz producenta');
                  return;
                }
                if (!newProduct.image_url) {
                  toast.error('Zdjęcie produktu jest wymagane');
                  return;
                }
                if (!newProduct.name || !newProduct.price) {
                  toast.error('Wypełnij wszystkie wymagane pola');
                  return;
                }
                await onCreateProduct({ 
                  ...newProduct, 
                  producer_id: newProduct.producer_id,
                  purchase_price: newProduct.purchase_price ? parseFloat(newProduct.purchase_price) : undefined
                });
                setNewProduct({ name: '', price: '', purchase_price: '', unit: 'szt', category_id: '', description: '', weight_volume: '', producer_id: '', image_url: '' });
              }} 
              className="w-full"
              disabled={!newProduct.producer_id || !newProduct.name || !newProduct.price || !newProduct.image_url || uploadingImage}
            >
              {uploadingImage ? 'Przesyłanie...' : 'Dodaj produkt'}
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
                <ProducerCard 
                  key={producer.id}
                  producer={producer}
                  productCount={productCount}
                  onClick={() => setSelectedProducerId(producer.id)}
                  onUpdate={onUpdateProducer}
                  onDelete={onDeleteProducer}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Separate component for producer card with gallery preview
function ProducerCard({ 
  producer, 
  productCount, 
  onClick,
  onUpdate,
  onDelete
}: { 
  producer: Producer; 
  productCount: number; 
  onClick: () => void;
  onUpdate: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<Producer>(producer);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setEditData(producer);
    setValidationErrors({});
  }, [producer]);

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${producer.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setEditData({ ...editData, logo_url: publicUrl });
      toast.success('Logo zostało przesłane');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Błąd podczas przesyłania logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    // Clear previous errors
    setValidationErrors({});
    
    // Validate form data
    const validation = producerSchema.safeParse(editData);
    
    if (!validation.success) {
      // Format validation errors
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast.error('Proszę poprawić błędy w formularzu');
      return;
    }

    try {
      await onUpdate(validation.data);
      setIsEditOpen(false);
      toast.success('Dane producenta zostały zaktualizowane');
    } catch (error) {
      console.error('Error updating producer:', error);
      toast.error('Nie udało się zaktualizować danych');
    }
  };

  return (
    <>
      <Card 
        className="cursor-pointer hover:border-primary transition-colors overflow-hidden relative group" 
      >
        {/* Logo or Hidden indicator */}
        <div className="absolute top-2 left-2 z-10 bg-background rounded-lg p-2 shadow-sm border">
          {!producer.active ? (
            <EyeOff className="h-6 w-6 text-muted-foreground" />
          ) : producer.logo_url ? (
            <img 
              src={producer.logo_url} 
              alt={`${producer.name} logo`}
              className="h-6 w-6 object-contain"
            />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Czy na pewno chcesz usunąć producenta "${producer.name}"? Ta operacja jest nieodwracalna.`)) {
                onDelete(producer.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div onClick={onClick}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{producer.name}</CardTitle>
                {producer.nip && (
                  <p className="text-xs text-muted-foreground">NIP: {producer.nip}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {productCount} {productCount === 1 ? 'produkt' : productCount < 5 ? 'produkty' : 'produktów'}
                </p>
              </div>
            </div>
          </CardHeader>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj producenta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <Label>Logo firmy</Label>
              <div className="flex items-center gap-4 mt-2">
                {editData.logo_url && (
                  <div className="relative">
                    <img 
                      src={editData.logo_url} 
                      alt="Logo preview"
                      className="h-20 w-20 object-contain border rounded-lg p-2"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setEditData({ ...editData, logo_url: '' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  disabled={uploadingLogo}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nazwa firmy *</Label>
                <Input
                  value={editData.name}
                  onChange={(e) => {
                    setEditData({ ...editData, name: e.target.value });
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: '' });
                    }
                  }}
                  placeholder="Nazwa producenta"
                  className={validationErrors.name ? 'border-destructive' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <Label>NIP</Label>
                <Input
                  value={editData.nip || ''}
                  onChange={(e) => {
                    setEditData({ ...editData, nip: e.target.value });
                    if (validationErrors.nip) {
                      setValidationErrors({ ...validationErrors, nip: '' });
                    }
                  }}
                  placeholder="1234567890"
                  maxLength={10}
                  className={validationErrors.nip ? 'border-destructive' : ''}
                />
                {validationErrors.nip && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.nip}</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email kontaktowy</Label>
                <Input
                  type="email"
                  value={editData.contact_email || ''}
                  onChange={(e) => {
                    setEditData({ ...editData, contact_email: e.target.value });
                    if (validationErrors.contact_email) {
                      setValidationErrors({ ...validationErrors, contact_email: '' });
                    }
                  }}
                  placeholder="kontakt@firma.pl"
                  className={validationErrors.contact_email ? 'border-destructive' : ''}
                />
                {validationErrors.contact_email && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.contact_email}</p>
                )}
              </div>
              <div>
                <Label>Telefon kontaktowy</Label>
                <Input
                  type="tel"
                  value={editData.contact_phone || ''}
                  onChange={(e) => {
                    setEditData({ ...editData, contact_phone: e.target.value });
                    if (validationErrors.contact_phone) {
                      setValidationErrors({ ...validationErrors, contact_phone: '' });
                    }
                  }}
                  placeholder="+48 123 456 789"
                  className={validationErrors.contact_phone ? 'border-destructive' : ''}
                />
                {validationErrors.contact_phone && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.contact_phone}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Opis</Label>
              <Textarea
                value={editData.description || ''}
                onChange={(e) => {
                  setEditData({ ...editData, description: e.target.value });
                  if (validationErrors.description) {
                    setValidationErrors({ ...validationErrors, description: '' });
                  }
                }}
                placeholder="Opis firmy..."
                rows={3}
                className={validationErrors.description ? 'border-destructive' : ''}
              />
              {validationErrors.description && (
                <p className="text-sm text-destructive mt-1">{validationErrors.description}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label>Notatki wewnętrzne</Label>
              <Textarea
                value={editData.notes || ''}
                onChange={(e) => {
                  setEditData({ ...editData, notes: e.target.value });
                  if (validationErrors.notes) {
                    setValidationErrors({ ...validationErrors, notes: '' });
                  }
                }}
                placeholder="Opiekun: Jan Kowalski, Rabat: 10%, Uwagi..."
                rows={4}
                className={validationErrors.notes ? 'border-destructive' : ''}
              />
              {validationErrors.notes && (
                <p className="text-sm text-destructive mt-1">{validationErrors.notes}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Informacje widoczne tylko dla administratorów (opiekun, rabaty, uwagi)
              </p>
            </div>

            {/* Visibility Status */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="hidden"
                checked={!editData.active}
                onChange={(e) => setEditData({ ...editData, active: !e.target.checked })}
                className="h-4 w-4"
              />
              <div className="flex-1">
                <Label htmlFor="hidden" className="cursor-pointer font-medium">
                  Ukryj producenta dla organizacji
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Gdy zaznaczone, producent nie będzie widoczny dla organizacji podczas wyboru produktów
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleSave} disabled={!editData.name}>
                Zapisz zmiany
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
