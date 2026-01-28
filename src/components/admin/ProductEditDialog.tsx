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
  price: number;
  purchase_price?: number;
  net_price?: number;
  for_dogs?: boolean;
  for_cats?: boolean;
  producer_id: string;
  category_id: string;
  description?: string;
  image_url?: string;
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
      await onUpdate({
        ...editData,
        price: typeof editData.price === 'string' ? parseFloat(editData.price) : editData.price,
        purchase_price: editData.purchase_price ? (typeof editData.purchase_price === 'string' ? parseFloat(editData.purchase_price) : editData.purchase_price) : undefined,
        net_price: editData.net_price ? (typeof editData.net_price === 'string' ? parseFloat(editData.net_price) : editData.net_price) : undefined,
        for_dogs: editData.for_dogs ?? true,
        for_cats: editData.for_cats ?? true,
      });
      toast.success('Produkt został zaktualizowany');
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Nie udało się zaktualizować produktu');
    }
  };

  const margin = editData.purchase_price && editData.price 
    ? (((editData.price - editData.purchase_price) / editData.price) * 100).toFixed(1)
    : null;

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

          {/* Prices */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Cena zakupu (u producenta)</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.purchase_price || ''}
                onChange={(e) => setEditData({ ...editData, purchase_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Cena netto (bez VAT)</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.net_price || ''}
                onChange={(e) => setEditData({ ...editData, net_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Cena brutto (z VAT) *</Label>
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
            <div className="text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">VAT: </span>
                <span className="font-semibold">{((editData.price - editData.net_price) / editData.net_price * 100).toFixed(0)}%</span>
                <span className="text-muted-foreground ml-2">({(editData.price - editData.net_price).toFixed(2)} zł)</span>
              </div>
              {margin && (
                <div>
                  <span className="text-muted-foreground">Marża: </span>
                  <span className="font-semibold text-primary">{margin}%</span>
                </div>
              )}
            </div>
          )}
          
          {!editData.net_price && margin && (
            <div className="text-sm">
              <span className="text-muted-foreground">Marża: </span>
              <span className="font-semibold text-primary">{margin}%</span>
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
