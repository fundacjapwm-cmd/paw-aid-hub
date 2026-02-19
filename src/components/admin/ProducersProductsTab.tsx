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
import { Plus, Edit, Trash2, ArrowLeft, Image, Upload, X, Check, ChevronsUpDown, EyeOff, Mail, Phone, Building2, FileText, Factory, Package, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { producerSchema } from '@/lib/validations/producer';
import { validateAndCompressImage } from '@/lib/validations/imageFile';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import ProductEditDialog from './ProductEditDialog';
import ExcelProductImport from './ExcelProductImport';

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
  purchase_net_price?: number;
  net_price?: number;
  product_code?: string;
  ean?: string;
  for_dogs?: boolean;
  for_cats?: boolean;
  producer_id: string;
  category_id: string;
  description?: string;
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


// Reusable component for logo with hover upload/remove
function ProducerLogoWithHover({ 
  producer, 
  onUpdate 
}: { 
  producer: Producer; 
  onUpdate: (data: any) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Validate and compress image
      const processedFile = await validateAndCompressImage(file);
      
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `logo-${producer.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      await onUpdate({ ...producer, logo_url: publicUrl });
      toast.success('Logo zostało zaktualizowane');
    } catch (error) {
      console.error('Error uploading logo:', error);
      const message = error instanceof Error ? error.message : 'Błąd podczas przesyłania logo';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await onUpdate({ ...producer, logo_url: '' });
      toast.success('Logo zostało usunięte');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Nie udało się usunąć logo');
    }
  };

  return (
    <div className="flex-shrink-0 relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      
      {producer.logo_url ? (
        <div className="h-24 w-24 border rounded-lg p-2 relative">
          <img 
            src={producer.logo_url} 
            alt={`${producer.name} logo`}
            className="h-full w-full object-contain"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            {uploading ? (
              <div className="text-xs text-muted-foreground">Przesyłanie...</div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div 
          className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="text-xs text-muted-foreground text-center px-2">Przesyłanie...</div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Dodaj logo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
  const [producerListSearchQuery, setProducerListSearchQuery] = useState('');

  // Clear product search when producer changes
  useEffect(() => {
    setProductSearchQuery('');
  }, [selectedProducerId]);

  const [newProducer, setNewProducer] = useState({
    name: '', contact_email: '', contact_phone: '', description: '', logo_url: '', nip: '', notes: '', active: true
  });

  const [newProduct, setNewProduct] = useState({
    name: '', 
    price: '', 
    purchase_price: '', 
    purchase_net_price: '',
    net_price: '',
    product_code: '',
    ean: '',
    for_dogs: true,
    for_cats: true,
    category_id: '', 
    description: '', 
    producer_id: '', 
    image_url: '',
    is_portion_sale: false,
    total_weight_kg: '',
    portion_size_kg: '',
  });

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      // Validate and compress image
      const processedFile = await validateAndCompressImage(file);
      
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      const message = error instanceof Error ? error.message : 'Błąd podczas przesyłania zdjęcia';
      toast.error(message);
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
    // Calculate portion prices if portion sale is enabled
    const portionData: any = {};
    if (newProduct.is_portion_sale && newProduct.total_weight_kg && newProduct.portion_size_kg) {
      const ratio = parseFloat(newProduct.portion_size_kg) / parseFloat(newProduct.total_weight_kg);
      if (newProduct.purchase_net_price) portionData.portion_purchase_net_price = parseFloat((parseFloat(newProduct.purchase_net_price) * ratio).toFixed(2));
      if (newProduct.purchase_price) portionData.portion_purchase_price = parseFloat((parseFloat(newProduct.purchase_price) * ratio).toFixed(2));
      if (newProduct.net_price) portionData.portion_net_price = parseFloat((parseFloat(newProduct.net_price) * ratio).toFixed(2));
      if (newProduct.price) portionData.portion_price = parseFloat((parseFloat(newProduct.price) * ratio).toFixed(2));
    }

    await onCreateProduct({ 
      ...newProduct, 
      producer_id: selectedProducerId,
      purchase_price: newProduct.purchase_price ? parseFloat(newProduct.purchase_price) : undefined,
      purchase_net_price: newProduct.purchase_net_price ? parseFloat(newProduct.purchase_net_price) : undefined,
      net_price: newProduct.net_price ? parseFloat(newProduct.net_price) : undefined,
      product_code: newProduct.product_code || undefined,
      ean: newProduct.ean || undefined,
      for_dogs: newProduct.for_dogs,
      for_cats: newProduct.for_cats,
      is_portion_sale: newProduct.is_portion_sale,
      total_weight_kg: newProduct.total_weight_kg ? parseFloat(newProduct.total_weight_kg) : null,
      portion_size_kg: newProduct.portion_size_kg ? parseFloat(newProduct.portion_size_kg) : null,
      ...portionData,
    });
    setNewProduct({ 
      name: '', 
      price: '', 
      purchase_price: '', 
      purchase_net_price: '',
      net_price: '',
      product_code: '',
      ean: '',
      for_dogs: true,
      for_cats: true,
      category_id: '', 
      description: '', 
      producer_id: '', 
      image_url: '',
      is_portion_sale: false,
      total_weight_kg: '',
      portion_size_kg: '',
    });
  };

  if (selectedProducerId) {
    const producer = producers.find(p => p.id === selectedProducerId);
    const producerProducts = products.filter(p => p.producer_id === selectedProducerId);

    // Filter products based on search query (minimum 3 characters) - searches name, EAN, and product_code
    const filteredProducts = productSearchQuery.length >= 3
      ? producerProducts.filter(p => {
          const query = productSearchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(query) ||
            (p.ean && p.ean.toLowerCase().includes(query)) ||
            (p.product_code && p.product_code.toLowerCase().includes(query))
          );
        })
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
              {/* Logo with hover upload/remove */}
              <ProducerLogoWithHover 
                producer={producer!}
                onUpdate={onUpdateProducer}
              />
              
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produkty - {producer?.name}</CardTitle>
                <CardDescription>Dodaj nowy produkt dla tego producenta</CardDescription>
              </div>
              <ExcelProductImport
                producerId={selectedProducerId}
                producerName={producer?.name || ''}
                productCategories={productCategories}
                onImportComplete={() => {
                  // Trigger a refresh - the realtime subscription will handle it
                  toast.info('Odświeżanie listy produktów...');
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Zdjęcie, nazwa i kody w jednym rzędzie */}
            <div className="flex gap-3">
              {/* Zdjęcie produktu */}
              <div className="flex-shrink-0">
                <Label>Zdjęcie *</Label>
                <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-20 w-20 flex items-center justify-center hover:border-primary/50 transition-colors mt-1">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
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

              {/* Nazwa i kody obok zdjęcia */}
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
                    <Label>Kod produktu</Label>
                    <Input 
                      value={newProduct.product_code} 
                      onChange={(e) => setNewProduct({ ...newProduct, product_code: e.target.value })} 
                      placeholder="np. KAR-001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>EAN</Label>
                    <Input 
                      value={newProduct.ean} 
                      onChange={(e) => setNewProduct({ ...newProduct, ean: e.target.value })} 
                      placeholder="np. 5901234123457"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ceny zakupu */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Ceny zakupu (od producenta)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Netto</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={newProduct.purchase_net_price} 
                    onChange={(e) => setNewProduct({ ...newProduct, purchase_net_price: e.target.value })} 
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Brutto</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={newProduct.purchase_price} 
                    onChange={(e) => setNewProduct({ ...newProduct, purchase_price: e.target.value })} 
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Ceny sprzedaży */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Ceny sprzedaży (dla klienta)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Netto</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={newProduct.net_price} 
                    onChange={(e) => setNewProduct({ ...newProduct, net_price: e.target.value })} 
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Brutto *</Label>
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
            </div>

            {/* Marża */}
            {newProduct.purchase_price && newProduct.price && parseFloat(newProduct.price) > 0 && parseFloat(newProduct.purchase_price) > 0 && (
              <div className="text-sm bg-muted/50 p-3 rounded-lg">
                <span className="text-muted-foreground">Marża brutto: </span>
                <span className="font-semibold text-primary">
                  {(((parseFloat(newProduct.price) - parseFloat(newProduct.purchase_price)) / parseFloat(newProduct.price)) * 100).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-2">
                  ({(parseFloat(newProduct.price) - parseFloat(newProduct.purchase_price)).toFixed(2)} zł)
                </span>
              </div>
            )}

            {/* Nadkategoria (dla kogo) */}
            <div>
              <Label>Nadkategoria (dla kogo)</Label>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new_for_dogs"
                    checked={newProduct.for_dogs}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, for_dogs: checked })}
                  />
                  <label htmlFor="new_for_dogs" className="text-sm font-medium cursor-pointer">
                    🐕 Psy
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new_for_cats"
                    checked={newProduct.for_cats}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, for_cats: checked })}
                  />
                  <label htmlFor="new_for_cats" className="text-sm font-medium cursor-pointer">
                    🐱 Koty
                  </label>
                </div>
              </div>
            </div>

            {/* Kategoria */}
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

            {/* Sprzedaż na kg */}
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center space-x-2">
                <Switch
                  id="new_is_portion_sale"
                  checked={newProduct.is_portion_sale}
                  onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_portion_sale: checked })}
                />
                <label htmlFor="new_is_portion_sale" className="text-sm font-medium cursor-pointer">
                  📦 Sprzedaż na kg (podział worka)
                </label>
              </div>
              {newProduct.is_portion_sale && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Waga całości (kg)</Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={newProduct.total_weight_kg} 
                        onChange={(e) => setNewProduct({ ...newProduct, total_weight_kg: e.target.value })} 
                        placeholder="np. 10"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Porcja sprzedaży (kg)</Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={newProduct.portion_size_kg} 
                        onChange={(e) => setNewProduct({ ...newProduct, portion_size_kg: e.target.value })} 
                        placeholder="np. 1"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  {newProduct.total_weight_kg && newProduct.portion_size_kg && parseFloat(newProduct.total_weight_kg) > 0 && parseFloat(newProduct.portion_size_kg) > 0 && (
                    <div className="text-sm bg-background p-3 rounded-lg space-y-1">
                      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Wyliczone ceny za {newProduct.portion_size_kg} kg:</p>
                      {(() => {
                        const ratio = parseFloat(newProduct.portion_size_kg) / parseFloat(newProduct.total_weight_kg);
                        return (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {newProduct.purchase_net_price && (
                              <div>Zakup netto: <span className="font-semibold">{(parseFloat(newProduct.purchase_net_price) * ratio).toFixed(2)} zł</span></div>
                            )}
                            {newProduct.purchase_price && (
                              <div>Zakup brutto: <span className="font-semibold">{(parseFloat(newProduct.purchase_price) * ratio).toFixed(2)} zł</span></div>
                            )}
                            {newProduct.net_price && (
                              <div>Sprzedaż netto: <span className="font-semibold">{(parseFloat(newProduct.net_price) * ratio).toFixed(2)} zł</span></div>
                            )}
                            {newProduct.price && (
                              <div>Sprzedaż brutto: <span className="font-semibold text-primary">{(parseFloat(newProduct.price) * ratio).toFixed(2)} zł</span></div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        {(product as any).is_portion_sale && (
                          <Badge variant="secondary" className="text-xs">📦 {(product as any).portion_size_kg} kg</Badge>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                        <span>Sprzedaż: {product.price} zł</span>
                        {(product as any).is_portion_sale && (product as any).portion_price && (
                          <span className="text-primary">za {(product as any).portion_size_kg} kg: {(product as any).portion_price} zł</span>
                        )}
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
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
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

            {/* Zdjęcie, nazwa i kody w jednym rzędzie */}
            <div className="flex gap-3">
              {/* Zdjęcie produktu */}
              <div className="flex-shrink-0">
                <Label>Zdjęcie *</Label>
                <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-20 w-20 flex items-center justify-center hover:border-primary/50 transition-colors mt-1">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
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

              {/* Nazwa i kody obok zdjęcia */}
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
                    <Label>Kod produktu</Label>
                    <Input 
                      value={newProduct.product_code} 
                      onChange={(e) => setNewProduct({ ...newProduct, product_code: e.target.value })} 
                      placeholder="np. KAR-001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>EAN</Label>
                    <Input 
                      value={newProduct.ean} 
                      onChange={(e) => setNewProduct({ ...newProduct, ean: e.target.value })} 
                      placeholder="np. 5901234123457"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ceny zakupu */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Ceny zakupu (od producenta)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Netto</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={newProduct.purchase_net_price} 
                    onChange={(e) => setNewProduct({ ...newProduct, purchase_net_price: e.target.value })} 
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Brutto</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={newProduct.purchase_price} 
                    onChange={(e) => setNewProduct({ ...newProduct, purchase_price: e.target.value })} 
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Ceny sprzedaży */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Ceny sprzedaży (dla klienta)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Netto</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={newProduct.net_price} 
                    onChange={(e) => setNewProduct({ ...newProduct, net_price: e.target.value })} 
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Brutto *</Label>
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
            </div>

            {/* Marża */}
            {newProduct.purchase_price && newProduct.price && parseFloat(newProduct.price) > 0 && parseFloat(newProduct.purchase_price) > 0 && (
              <div className="text-sm bg-muted/50 p-3 rounded-lg">
                <span className="text-muted-foreground">Marża brutto: </span>
                <span className="font-semibold text-primary">
                  {(((parseFloat(newProduct.price) - parseFloat(newProduct.purchase_price)) / parseFloat(newProduct.price)) * 100).toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-2">
                  ({(parseFloat(newProduct.price) - parseFloat(newProduct.purchase_price)).toFixed(2)} zł)
                </span>
              </div>
            )}

            {/* Nadkategoria (dla kogo) */}
            <div>
              <Label>Nadkategoria (dla kogo)</Label>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="quick_for_dogs"
                    checked={newProduct.for_dogs}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, for_dogs: checked })}
                  />
                  <label htmlFor="quick_for_dogs" className="text-sm font-medium cursor-pointer">
                    🐕 Psy
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="quick_for_cats"
                    checked={newProduct.for_cats}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, for_cats: checked })}
                  />
                  <label htmlFor="quick_for_cats" className="text-sm font-medium cursor-pointer">
                    🐱 Koty
                  </label>
                </div>
              </div>
            </div>

            {/* Kategoria */}
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
                  purchase_price: newProduct.purchase_price ? parseFloat(newProduct.purchase_price) : undefined,
                  purchase_net_price: newProduct.purchase_net_price ? parseFloat(newProduct.purchase_net_price) : undefined,
                  net_price: newProduct.net_price ? parseFloat(newProduct.net_price) : undefined,
                  product_code: newProduct.product_code || undefined,
                  ean: newProduct.ean || undefined,
                  for_dogs: newProduct.for_dogs,
                  for_cats: newProduct.for_cats,
                });
                setNewProduct({ 
                  name: '', 
                  price: '', 
                  purchase_price: '', 
                  purchase_net_price: '',
                  net_price: '',
                  product_code: '',
                  ean: '',
                  for_dogs: true,
                  for_cats: true,
                  category_id: '', 
                  description: '', 
                  producer_id: '', 
                  image_url: '',
                  is_portion_sale: false,
                  total_weight_kg: '',
                  portion_size_kg: '',
                });
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Producenci ({producers.length})</CardTitle>
              <CardDescription>Kliknij na producenta, aby zobaczyć i zarządzać jego produktami</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Szukaj producenta po nazwie..."
              value={producerListSearchQuery}
              onChange={(e) => setProducerListSearchQuery(e.target.value)}
              className="w-full"
            />
            {producerListSearchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setProducerListSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filtered count */}
          {producerListSearchQuery && (
            <p className="text-sm text-muted-foreground">
              Znaleziono: {producers.filter(p => 
                p.name.toLowerCase().includes(producerListSearchQuery.toLowerCase())
              ).length}
            </p>
          )}

          {/* Producer Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {producers
              .filter(p => 
                producerListSearchQuery === '' || 
                p.name.toLowerCase().includes(producerListSearchQuery.toLowerCase())
              )
              .map((producer) => {
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

          {/* No results message */}
          {producerListSearchQuery && producers.filter(p => 
            p.name.toLowerCase().includes(producerListSearchQuery.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nie znaleziono producentów
            </div>
          )}
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
      // Validate and compress image
      const processedFile = await validateAndCompressImage(file);
      
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `logo-${producer.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setEditData({ ...editData, logo_url: publicUrl });
      toast.success('Logo zostało przesłane');
    } catch (error) {
      console.error('Error uploading logo:', error);
      const message = error instanceof Error ? error.message : 'Błąd podczas przesyłania logo';
      toast.error(message);
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
      // Include id in the update data
      await onUpdate({ ...validation.data, id: producer.id });
      setIsEditOpen(false);
      toast.success('Dane producenta zostały zaktualizowane');
    } catch (error) {
      console.error('Error updating producer:', error);
      toast.error('Nie udało się zaktualizować danych');
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await onUpdate({ ...producer, logo_url: '' });
      setEditData({ ...editData, logo_url: '' });
      toast.success('Logo zostało usunięte');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Nie udało się usunąć logo');
    }
  };

  const handleQuickLogoUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingLogo(true);
    try {
      // Validate and compress image
      const processedFile = await validateAndCompressImage(file);
      
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `logo-${producer.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      await onUpdate({ ...producer, logo_url: publicUrl });
      setEditData({ ...editData, logo_url: publicUrl });
      toast.success('Logo zostało zaktualizowane');
    } catch (error) {
      console.error('Error uploading logo:', error);
      const message = error instanceof Error ? error.message : 'Błąd podczas przesyłania logo';
      toast.error(message);
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full rounded-3xl shadow-card hover:shadow-bubbly transition-all duration-300 bg-background group">
        {/* Info Section */}
        <div className="p-5 flex gap-4 items-start flex-1 cursor-pointer" onClick={onClick}>
          {/* Logo Container */}
          <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center flex-shrink-0 border-2 border-transparent group-hover:border-primary/20 transition-colors">
            {!producer.active ? (
              <EyeOff className="h-8 w-8 text-muted-foreground" />
            ) : producer.logo_url ? (
              <img 
                src={producer.logo_url} 
                alt={`${producer.name} logo`}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <Factory className="h-8 w-8 text-primary/50" />
            )}
          </div>

          {/* Data */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-bold text-lg leading-tight text-foreground truncate">
              {producer.name}
            </h3>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>NIP: {producer.nip || 'Brak'}</span>
            </div>

            <Badge 
              variant="secondary" 
              className="mt-2 rounded-lg bg-accent/10 text-accent-foreground hover:bg-accent/20"
            >
              <Package className="h-3 w-3 mr-1" />
              {productCount} {productCount === 1 ? 'produkt' : productCount < 5 ? 'produkty' : 'produktów'}
            </Badge>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="grid grid-cols-2 border-t border-border/40">
          <Button 
            variant="ghost" 
            className="h-12 rounded-none rounded-bl-3xl hover:bg-primary/5 hover:text-primary gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            Edytuj
          </Button>
          <Button 
            variant="ghost" 
            className="h-12 rounded-none rounded-br-3xl hover:bg-destructive/5 hover:text-destructive border-l border-border/40 gap-2"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Czy na pewno chcesz usunąć producenta "${producer.name}"? Ta operacja jest nieodwracalna.`)) {
                onDelete(producer.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Usuń
          </Button>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj producenta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Logo Upload with hover */}
            <div>
              <Label>Logo firmy</Label>
              <div className="mt-2">
                <div className="relative group inline-block">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    className="hidden"
                    id="edit-logo-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                    disabled={uploadingLogo}
                  />
                  
                  {editData.logo_url ? (
                    <div className="h-24 w-24 border rounded-lg p-2 relative">
                      <img 
                        src={editData.logo_url} 
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                        {uploadingLogo ? (
                          <div className="text-xs text-muted-foreground">Przesyłanie...</div>
                        ) : (
                          <>
                            <label htmlFor="edit-logo-upload" className="cursor-pointer">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 pointer-events-none"
                                asChild
                              >
                                <span><Upload className="h-4 w-4" /></span>
                              </Button>
                            </label>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditData({ ...editData, logo_url: '' })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label 
                      htmlFor="edit-logo-upload"
                      className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors block"
                    >
                      {uploadingLogo ? (
                        <div className="text-xs text-muted-foreground text-center px-2">Przesyłanie...</div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Dodaj logo</span>
                        </div>
                      )}
                    </label>
                  )}
                </div>
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
