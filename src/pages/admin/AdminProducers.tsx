import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ProducersProductsTab from '@/components/admin/ProducersProductsTab';

interface Producer {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  description?: string;
  active: boolean;
  created_at: string;
}

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  producer_id: string;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
  category_id: string;
  producer_id: string;
  description?: string;
  producers?: { name: string };
  product_categories?: { name: string };
}

export default function AdminProducers() {
  const { user, profile, loading } = useAuth();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (loading || !user || profile?.role !== 'ADMIN') {
      return;
    }

    fetchProducers();
    fetchProductCategories();
    fetchProducts();

    const producersChannel = supabase
      .channel('producers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'producers' }, () => {
        fetchProducers();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, () => {
        fetchProductCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(producersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, [loading, user, profile]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p>Ładowanie...</p></div>;
  }

  if (!user || profile?.role !== 'ADMIN') {
    return <Navigate to="/auth" replace />;
  }

  const fetchProducers = async () => {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać producentów",
        variant: "destructive"
      });
    } else {
      setProducers(data || []);
    }
  };

  const fetchProductCategories = async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać kategorii produktów",
        variant: "destructive"
      });
    } else {
      setProductCategories((data || []) as any);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        producers(name),
        product_categories(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać produktów",
        variant: "destructive"
      });
    } else {
      setProducts(data || []);
    }
  };

  const createProducer = async (newProducer: any) => {
    if (!newProducer.name) {
      toast({
        title: "Błąd",
        description: "Nazwa producenta jest wymagana",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('producers')
      .insert({
        name: newProducer.name,
        contact_email: newProducer.contact_email || null,
        contact_phone: newProducer.contact_phone || null,
        description: newProducer.description || null,
        logo_url: newProducer.logo_url || null,
        nip: newProducer.nip || null,
        notes: newProducer.notes || null,
        active: newProducer.active ?? true
      });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać producenta",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Producent został dodany"
      });
      fetchProducers();
    }
  };

  const updateProducer = async (editingProducer: any) => {
    if (!editingProducer) return;

    const { error } = await supabase
      .from('producers')
      .update({
        name: editingProducer.name,
        contact_email: editingProducer.contact_email,
        contact_phone: editingProducer.contact_phone,
        description: editingProducer.description,
        logo_url: editingProducer.logo_url,
        nip: editingProducer.nip,
        notes: editingProducer.notes,
        active: editingProducer.active
      })
      .eq('id', editingProducer.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować producenta",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Producent został zaktualizowany"
      });
      fetchProducers();
    }
  };

  const deleteProducer = async (id: string) => {
    const { error } = await supabase
      .from('producers')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć producenta",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Producent został usunięty"
      });
      fetchProducers();
    }
  };

  const createProduct = async (newProduct: any) => {
    if (!newProduct.name || !newProduct.price || !newProduct.category_id || !newProduct.producer_id) {
      toast({
        title: "Błąd",
        description: "Nazwa, cena, kategoria i producent są wymagane",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('products')
      .insert({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        purchase_price: newProduct.purchase_price ? parseFloat(newProduct.purchase_price) : null,
        purchase_net_price: newProduct.purchase_net_price ? parseFloat(newProduct.purchase_net_price) : null,
        net_price: newProduct.net_price ? parseFloat(newProduct.net_price) : null,
        product_code: newProduct.product_code || null,
        ean: newProduct.ean || null,
        for_dogs: newProduct.for_dogs ?? true,
        for_cats: newProduct.for_cats ?? true,
        description: newProduct.description || null,
        image_url: newProduct.image_url || null,
        category_id: newProduct.category_id,
        producer_id: newProduct.producer_id,
        is_portion_sale: newProduct.is_portion_sale ?? false,
        total_weight_kg: newProduct.total_weight_kg || null,
        portion_size_kg: newProduct.portion_size_kg || null,
        portion_price: newProduct.portion_price || null,
        portion_net_price: newProduct.portion_net_price || null,
        portion_purchase_price: newProduct.portion_purchase_price || null,
        portion_purchase_net_price: newProduct.portion_purchase_net_price || null,
      });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać produktu",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Produkt został dodany"
      });
      fetchProducts();
    }
  };

  const updateProduct = async (editingProduct: any) => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from('products')
      .update({
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        purchase_price: editingProduct.purchase_price ? parseFloat(editingProduct.purchase_price) : null,
        purchase_net_price: editingProduct.purchase_net_price ? parseFloat(editingProduct.purchase_net_price) : null,
        net_price: editingProduct.net_price ? parseFloat(editingProduct.net_price) : null,
        product_code: editingProduct.product_code || null,
        ean: editingProduct.ean || null,
        for_dogs: editingProduct.for_dogs ?? true,
        for_cats: editingProduct.for_cats ?? true,
        description: editingProduct.description || null,
        image_url: editingProduct.image_url || null,
        category_id: editingProduct.category_id,
        producer_id: editingProduct.producer_id,
        active: editingProduct.active,
        is_portion_sale: editingProduct.is_portion_sale ?? false,
        total_weight_kg: editingProduct.total_weight_kg || null,
        portion_size_kg: editingProduct.portion_size_kg || null,
        portion_price: editingProduct.portion_price || null,
        portion_net_price: editingProduct.portion_net_price || null,
        portion_purchase_price: editingProduct.portion_purchase_price || null,
        portion_purchase_net_price: editingProduct.portion_purchase_net_price || null,
      })
      .eq('id', editingProduct.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować produktu",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Produkt został zaktualizowany"
      });
      fetchProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć produktu",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Produkt został usunięty"
      });
      fetchProducts();
    }
  };

  return (
    <ProducersProductsTab
      producers={producers}
      products={products}
      productCategories={productCategories}
      onCreateProducer={createProducer}
      onUpdateProducer={updateProducer}
      onDeleteProducer={deleteProducer}
      onCreateProduct={createProduct}
      onUpdateProduct={updateProduct}
      onDeleteProduct={deleteProduct}
    />
  );
}
