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
import { Plus, Edit, Trash2, ArrowLeft, Image, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { producerSchema } from '@/lib/validations/producer';
import { z } from 'zod';

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

interface ProducerImage {
  id: string;
  producer_id: string;
  image_url: string;
  display_order: number;
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
  const [producerImages, setProducerImages] = useState<ProducerImage[]>([]);

  const [newProducer, setNewProducer] = useState({
    name: '', contact_email: '', contact_phone: '', description: '', logo_url: '', nip: '', notes: '', active: true
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
    await onCreateProduct({ ...newProduct, producer_id: selectedProducerId });
    setNewProduct({ name: '', price: '', unit: 'szt', category_id: '', description: '', weight_volume: '', producer_id: '', image_url: '' });
  };

  // Fetch producer images when a producer is selected
  useEffect(() => {
    if (selectedProducerId) {
      fetchProducerImages(selectedProducerId);
    } else {
      setProducerImages([]);
    }
  }, [selectedProducerId]);

  const fetchProducerImages = async (producerId: string) => {
    try {
      const { data, error } = await supabase
        .from('producer_images')
        .select('*')
        .eq('producer_id', producerId)
        .order('display_order');

      if (error) throw error;
      setProducerImages(data || []);
    } catch (error) {
      console.error('Error fetching producer images:', error);
      toast.error('Nie udało się pobrać zdjęć producenta');
    }
  };

  const handleUploadProducerImage = async (file: File, producerId: string) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `producer-${producerId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Get the highest display_order and add 1
      const maxOrder = producerImages.length > 0 
        ? Math.max(...producerImages.map(img => img.display_order))
        : -1;

      const { error: insertError } = await supabase
        .from('producer_images')
        .insert({
          producer_id: producerId,
          image_url: publicUrl,
          display_order: maxOrder + 1
        });

      if (insertError) throw insertError;

      toast.success('Zdjęcie zostało dodane');
      fetchProducerImages(producerId);
    } catch (error) {
      console.error('Error uploading producer image:', error);
      toast.error('Błąd podczas przesyłania zdjęcia');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProducerImage = async (imageId: string, producerId: string) => {
    try {
      const { error } = await supabase
        .from('producer_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Zdjęcie zostało usunięte');
      fetchProducerImages(producerId);
    } catch (error) {
      console.error('Error deleting producer image:', error);
      toast.error('Nie udało się usunąć zdjęcia');
    }
  };

  if (selectedProducerId) {
    const producer = producers.find(p => p.id === selectedProducerId);
    const producerProducts = products.filter(p => p.producer_id === selectedProducerId);

    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setSelectedProducerId(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót do listy producentów
        </Button>

        {/* Producer Gallery Section */}
        <Card>
          <CardHeader>
            <CardTitle>Galeria zdjęć - {producer?.name}</CardTitle>
            <CardDescription>Zarządzaj zdjęciami producenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {producerImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img 
                    src={image.image_url} 
                    alt={`${producer?.name} zdjęcie ${image.display_order + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteProducerImage(image.id, selectedProducerId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-40 flex items-center justify-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && selectedProducerId) {
                      await handleUploadProducerImage(file, selectedProducerId);
                    }
                  }}
                  disabled={uploadingImage}
                />
                <div className="text-center pointer-events-none">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploadingImage ? 'Przesyłanie...' : 'Dodaj zdjęcie'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produkty - {producer?.name}</CardTitle>
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
            <CardDescription>Uzupełnij dane nowego producenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo firmy</Label>
              <div className="flex items-center gap-4">
                <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-24 w-24 flex items-center justify-center hover:border-primary/50 transition-colors">
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
                    <div className="text-center pointer-events-none">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    </div>
                  )}
                </div>
                {newProducer.logo_url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNewProducer({ ...newProducer, logo_url: '' })}
                  >
                    Usuń logo
                  </Button>
                )}
              </div>
            </div>

            {/* Nazwa producenta */}
            <div className="space-y-2">
              <Label htmlFor="producer-name">Nazwa producenta *</Label>
              <Input 
                id="producer-name"
                value={newProducer.name} 
                onChange={(e) => setNewProducer({ ...newProducer, name: e.target.value })} 
                placeholder="np. Brit Care, Royal Canin" 
              />
            </div>

            {/* NIP */}
            <div className="space-y-2">
              <Label htmlFor="producer-nip">NIP</Label>
              <Input 
                id="producer-nip"
                value={newProducer.nip} 
                onChange={(e) => setNewProducer({ ...newProducer, nip: e.target.value })} 
                placeholder="10 cyfr"
                maxLength={10}
              />
            </div>

            {/* Email i Telefon */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="producer-email">Email kontaktowy</Label>
                <Input 
                  id="producer-email"
                  type="email"
                  value={newProducer.contact_email} 
                  onChange={(e) => setNewProducer({ ...newProducer, contact_email: e.target.value })} 
                  placeholder="kontakt@firma.pl" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="producer-phone">Telefon kontaktowy</Label>
                <Input 
                  id="producer-phone"
                  type="tel"
                  value={newProducer.contact_phone} 
                  onChange={(e) => setNewProducer({ ...newProducer, contact_phone: e.target.value })} 
                  placeholder="+48 123 456 789" 
                />
              </div>
            </div>

            {/* Opis */}
            <div className="space-y-2">
              <Label htmlFor="producer-description">Opis</Label>
              <Textarea 
                id="producer-description"
                value={newProducer.description} 
                onChange={(e) => setNewProducer({ ...newProducer, description: e.target.value })} 
                placeholder="Krótki opis producenta..."
                rows={3}
              />
            </div>

            {/* Notatka wewnętrzna */}
            <div className="space-y-2">
              <Label htmlFor="producer-notes">Notatka wewnętrzna</Label>
              <Textarea 
                id="producer-notes"
                value={newProducer.notes} 
                onChange={(e) => setNewProducer({ ...newProducer, notes: e.target.value })} 
                placeholder="Notatki dla administratorów..."
                rows={2}
              />
            </div>

            {/* Aktywny */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="producer-active" className="cursor-pointer">Producent aktywny</Label>
                <p className="text-sm text-muted-foreground">Widoczny dla organizacji</p>
              </div>
              <Switch 
                id="producer-active"
                checked={newProducer.active} 
                onCheckedChange={(checked) => setNewProducer({ ...newProducer, active: checked })}
              />
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
                <ProducerCard 
                  key={producer.id}
                  producer={producer}
                  productCount={productCount}
                  onClick={() => setSelectedProducerId(producer.id)}
                  onUpdate={onUpdateProducer}
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
  onUpdate
}: { 
  producer: Producer; 
  productCount: number; 
  onClick: () => void;
  onUpdate: (data: any) => Promise<void>;
}) {
  const [images, setImages] = useState<ProducerImage[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<Producer>(producer);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from('producer_images')
        .select('*')
        .eq('producer_id', producer.id)
        .order('display_order')
        .limit(3);
      
      setImages(data || []);
    };
    
    fetchImages();
  }, [producer.id]);

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
        {/* Logo overlay */}
        {producer.logo_url && (
          <div className="absolute top-2 left-2 z-10 bg-white rounded-lg p-2 shadow-sm">
            <img 
              src={producer.logo_url} 
              alt={`${producer.name} logo`}
              className="h-8 w-8 object-contain"
            />
          </div>
        )}
        
        {/* Edit button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>

        <div onClick={onClick}>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-1 h-32 overflow-hidden">
              {images.map((img) => (
                <div key={img.id} className="relative">
                  <img 
                    src={img.image_url} 
                    alt={producer.name}
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
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
                {images.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {images.length} {images.length === 1 ? 'zdjęcie' : images.length < 5 ? 'zdjęcia' : 'zdjęć'}
                  </p>
                )}
              </div>
              <Badge variant={producer.active ? 'default' : 'secondary'}>
                {producer.active ? 'Aktywny' : 'Nieaktywny'}
              </Badge>
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

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={editData.active}
                onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="active">Producent aktywny</Label>
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
