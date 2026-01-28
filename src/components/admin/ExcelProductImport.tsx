import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileSpreadsheet, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductCategory {
  id: string;
  name: string;
}

interface Props {
  producerId: string;
  producerName: string;
  productCategories: ProductCategory[];
  onImportComplete: () => void;
}

export default function ExcelProductImport({ 
  producerId, 
  producerName, 
  productCategories,
  onImportComplete 
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!selectedFile || !categoryId) {
      toast.error('Wybierz plik i kategorię');
      return;
    }

    setImporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Musisz być zalogowany');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('producer_id', producerId);
      formData.append('category_id', categoryId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-products`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      toast.success(
        `Zaimportowano ${result.inserted} z ${result.total_parsed} produktów`,
        {
          description: result.parse_errors > 0 
            ? `${result.parse_errors} błędów parsowania` 
            : undefined,
        }
      );

      if (result.sample_errors?.length > 0) {
        console.log('Import errors:', result.sample_errors);
      }

      setOpen(false);
      setSelectedFile(null);
      setCategoryId('');
      onImportComplete();

    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Błąd importu');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Import z Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import produktów z Excel</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            Importuj produkty dla: <strong>{producerName}</strong>
          </div>

          <div className="space-y-2">
            <Label>Plik Excel (.xlsx, .xls)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="hidden"
                id="excel-file-input"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label 
                htmlFor="excel-file-input" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {selectedFile ? (
                  <>
                    <FileSpreadsheet className="h-10 w-10 text-primary" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Kliknij aby wybrać plik
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kategoria produktów</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Wymagany format kolumn:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Kolumna A - Nazwa produktu</li>
              <li>Kolumna B - Opis (opcjonalnie)</li>
              <li>Kolumna F - Cena zakupu brutto</li>
              <li>Kolumna H - Cena sprzedaży brutto</li>
              <li>Kolumna I - URL obrazka (opcjonalnie)</li>
            </ul>
          </div>

          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || !categoryId || importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importowanie...
              </>
            ) : (
              'Importuj produkty'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
