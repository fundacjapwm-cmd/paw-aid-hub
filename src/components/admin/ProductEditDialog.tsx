import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateAndCompressImage } from '@/lib/validations/imageFile';

interface Product {
  id: string;
  name: string;
  product_code?: string;
  ean?: string;
  price: number;
  purchase_price?: number;
  purchase_net_price?: number;
  net_price?: number;
  for_dogs?: boolean;
  for_cats?: boolean;
  producer_id: string;
  category_id: string;
  description?: string;
  image_url?: string;
  is_portion_sale?: boolean;
  total_weight_kg?: number;
  portion_size_kg?: number;
  portion_price?: number;
  portion_net_price?: number;
  portion_purchase_price?: number;
  portion_purchase_net_price?: number;
}

interface ProductCategory {
  id: string;
  name: string;
}

interface Props {
  product: Product | null;
  productCategories: ProductCategory[];
  onClose: () => void;
  onUpdate: (data: any) => Promise<void>;
}

export default function ProductEditDialog({ product, productCategories, onClose, onUpdate }: Props) {
  const [editData, setEditData] = useState<Product | null>(product);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setEditData(product);
  }, [product]);

  if (!editData) return null;

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      // Validate and compress image
      const processedFile = await validateAndCompressImage(file);
      
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `product-${editData.id}-${Date.now()}.${fileExt}`;

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

  const handleSave = async () => {
    if (!editData.name || !editData.price) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      // Calculate portion prices if portion sale is enabled
      const portionData: any = {};
      if (editData.is_portion_sale && editData.total_weight_kg && editData.portion_size_kg) {
        const ratio = editData.portion_size_kg / editData.total_weight_kg;
        const price = typeof editData.price === 'string' ? parseFloat(editData.price) : editData.price;
        if (editData.purchase_net_price) portionData.portion_purchase_net_price = parseFloat(((typeof editData.purchase_net_price === 'string' ? parseFloat(editData.purchase_net_price) : editData.purchase_net_price) * ratio).toFixed(2));
        if (editData.purchase_price) portionData.portion_purchase_price = parseFloat(((typeof editData.purchase_price === 'string' ? parseFloat(editData.purchase_price) : editData.purchase_price) * ratio).toFixed(2));
        if (editData.net_price) portionData.portion_net_price = parseFloat(((typeof editData.net_price === 'string' ? parseFloat(editData.net_price) : editData.net_price) * ratio).toFixed(2));
        if (price) portionData.portion_price = parseFloat((price * ratio).toFixed(2));
      }

      await onUpdate({
        ...editData,
        price: typeof editData.price === 'string' ? parseFloat(editData.price) : editData.price,
        purchase_price: editData.purchase_price ? (typeof editData.purchase_price === 'string' ? parseFloat(editData.purchase_price) : editData.purchase_price) : undefined,
        purchase_net_price: editData.purchase_net_price ? (typeof editData.purchase_net_price === 'string' ? parseFloat(editData.purchase_net_price) : editData.purchase_net_price) : undefined,
        net_price: editData.net_price ? (typeof editData.net_price === 'string' ? parseFloat(editData.net_price) : editData.net_price) : undefined,
        for_dogs: editData.for_dogs ?? true,
        for_cats: editData.for_cats ?? true,
        is_portion_sale: editData.is_portion_sale ?? false,
        total_weight_kg: editData.total_weight_kg || null,
        portion_size_kg: editData.portion_size_kg || null,
        ...portionData,
      });
      toast.success('Produkt został zaktualizowany');
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Nie udało się zaktualizować produktu');
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj produkt</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image */}
          <div>
            <Label>Zdjęcie produktu</Label>
            <div className="flex items-center gap-4 mt-2">
              {editData.image_url && (
                <div className="relative">
                  <img 
                    src={editData.image_url} 
                    alt="Preview"
                    className="h-20 w-20 object-cover border rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => setEditData({ ...editData, image_url: '' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-20 w-20 flex items-center justify-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await handleImageUpload(file);
                      if (url) setEditData({ ...editData, image_url: url });
                    }
                  }}
                  disabled={uploadingImage}
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label>Nazwa produktu *</Label>
            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="np. Karma dla psa"
            />
          </div>

          {/* Product codes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Kod produktu</Label>
              <Input
                value={editData.product_code || ''}
                onChange={(e) => setEditData({ ...editData, product_code: e.target.value || undefined })}
                placeholder="np. KAR-001"
              />
            </div>
            <div>
              <Label>EAN</Label>
              <Input
                value={editData.ean || ''}
                onChange={(e) => setEditData({ ...editData, ean: e.target.value || undefined })}
                placeholder="np. 5901234123457"
              />
            </div>
          </div>

          {/* Purchase Prices */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Ceny zakupu (od producenta)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Netto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.purchase_net_price || ''}
                  onChange={(e) => setEditData({ ...editData, purchase_net_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Brutto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.purchase_price || ''}
                  onChange={(e) => setEditData({ ...editData, purchase_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0.00"
                />
              </div>
            </div>
            {editData.purchase_net_price && editData.purchase_price && (
              <div className="text-xs text-muted-foreground">
                VAT zakupu: {((editData.purchase_price - editData.purchase_net_price) / editData.purchase_net_price * 100).toFixed(0)}%
              </div>
            )}
          </div>

          {/* Selling Prices */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Ceny sprzedaży (dla klienta)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Netto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.net_price || ''}
                  onChange={(e) => setEditData({ ...editData, net_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Brutto *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </div>
            {editData.net_price && editData.price && (
              <div className="text-xs text-muted-foreground">
                VAT sprzedaży: {((editData.price - editData.net_price) / editData.net_price * 100).toFixed(0)}%
              </div>
            )}
          </div>
          
          {/* Margin calculation */}
          {editData.purchase_price && editData.price && (
            <div className="text-sm bg-muted/50 p-3 rounded-lg">
              <span className="text-muted-foreground">Marża brutto: </span>
              <span className="font-semibold text-primary">
                {(((editData.price - editData.purchase_price) / editData.price) * 100).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-2">
                ({(editData.price - editData.purchase_price).toFixed(2)} zł)
              </span>
            </div>
          )}

          {/* Species checkboxes */}
          <div>
            <Label>Nadkategoria (dla kogo)</Label>
            <div className="flex gap-6 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="for_dogs"
                  checked={editData.for_dogs ?? true}
                  onCheckedChange={(checked) => setEditData({ ...editData, for_dogs: checked as boolean })}
                />
                <label htmlFor="for_dogs" className="text-sm font-medium cursor-pointer">
                  🐕 Psy
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="for_cats"
                  checked={editData.for_cats ?? true}
                  onCheckedChange={(checked) => setEditData({ ...editData, for_cats: checked as boolean })}
                />
                <label htmlFor="for_cats" className="text-sm font-medium cursor-pointer">
                  🐱 Koty
                </label>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label>Kategoria</Label>
            <Select value={editData.category_id} onValueChange={(value) => setEditData({ ...editData, category_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sprzedaż na kg */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_is_portion_sale"
                checked={editData.is_portion_sale ?? false}
                onCheckedChange={(checked) => setEditData({ ...editData, is_portion_sale: checked as boolean })}
              />
              <label htmlFor="edit_is_portion_sale" className="text-sm font-medium cursor-pointer">
                📦 Sprzedaż na kg (podział worka)
              </label>
            </div>
            {editData.is_portion_sale && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Waga całości (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editData.total_weight_kg || ''}
                      onChange={(e) => setEditData({ ...editData, total_weight_kg: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="np. 10"
                    />
                  </div>
                  <div>
                    <Label>Porcja sprzedaży (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editData.portion_size_kg || ''}
                      onChange={(e) => setEditData({ ...editData, portion_size_kg: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="np. 1"
                    />
                  </div>
                </div>
                {editData.total_weight_kg && editData.portion_size_kg && editData.total_weight_kg > 0 && editData.portion_size_kg > 0 && (
                  <div className="text-sm bg-background p-3 rounded-lg space-y-1">
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Wyliczone ceny za {editData.portion_size_kg} kg:</p>
                    {(() => {
                      const ratio = editData.portion_size_kg! / editData.total_weight_kg!;
                      const price = typeof editData.price === 'string' ? parseFloat(editData.price) : editData.price;
                      return (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {editData.purchase_net_price && (
                            <div>Zakup netto: <span className="font-semibold">{((typeof editData.purchase_net_price === 'string' ? parseFloat(editData.purchase_net_price) : editData.purchase_net_price) * ratio).toFixed(2)} zł</span></div>
                          )}
                          {editData.purchase_price && (
                            <div>Zakup brutto: <span className="font-semibold">{((typeof editData.purchase_price === 'string' ? parseFloat(editData.purchase_price) : editData.purchase_price) * ratio).toFixed(2)} zł</span></div>
                          )}
                          {editData.net_price && (
                            <div>Sprzedaż netto: <span className="font-semibold">{((typeof editData.net_price === 'string' ? parseFloat(editData.net_price) : editData.net_price) * ratio).toFixed(2)} zł</span></div>
                          )}
                          {price && (
                            <div>Sprzedaż brutto: <span className="font-semibold text-primary">{(price * ratio).toFixed(2)} zł</span></div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label>Opis produktu</Label>
            <Textarea
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Szczegółowy opis produktu..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button onClick={handleSave} disabled={!editData.name || !editData.price || uploadingImage}>
              {uploadingImage ? 'Przesyłanie...' : 'Zapisz zmiany'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
