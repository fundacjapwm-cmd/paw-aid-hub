import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateImageFile } from '@/lib/validations/imageFile';

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
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return null;
    }
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${editData.id}-${Date.now()}.${fileExt}`;
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
      console.error('Error uploading image:', error);
      toast.error('Błąd podczas przesyłania zdjęcia');
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
          <div className="grid grid-cols-2 gap-4">
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
              <Label>Cena sprzedaży *</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          </div>
          
          {margin && (
            <div className="text-sm">
              <span className="text-muted-foreground">Marża: </span>
              <span className="font-semibold text-primary">{margin}%</span>
            </div>
          )}

          {/* Unit, Category, Weight */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Jednostka</Label>
              <Select value={editData.unit} onValueChange={(value) => setEditData({ ...editData, unit: value })}>
                <SelectTrigger>
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
            <div>
              <Label>Waga/Objętość</Label>
              <Input
                value={editData.weight_volume || ''}
                onChange={(e) => setEditData({ ...editData, weight_volume: e.target.value })}
                placeholder="2kg, 500ml"
              />
            </div>
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
