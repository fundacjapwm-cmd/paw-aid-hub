-- Create animals table
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL, -- pies, kot, etc.
  breed TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  description TEXT,
  health_status TEXT,
  adoption_status TEXT NOT NULL DEFAULT 'available' CHECK (adoption_status IN ('available', 'adopted', 'pending', 'unavailable')),
  photos JSONB DEFAULT '[]'::jsonb,
  special_needs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create producers table  
CREATE TABLE public.producers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  logo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product categories
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE CASCADE NOT NULL,
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'szt', -- szt, kg, l, etc.
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity logs for admin actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for animals
CREATE POLICY "Animals viewable by everyone" ON public.animals FOR SELECT USING (true);
CREATE POLICY "Admins can manage all animals" ON public.animals FOR ALL USING (is_admin());
CREATE POLICY "Organizations can manage their animals" ON public.animals FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM organization_users ou 
    WHERE ou.organization_id = animals.organization_id 
    AND ou.user_id = auth.uid()
  ));

-- RLS Policies for producers
CREATE POLICY "Producers viewable by everyone" ON public.producers FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage producers" ON public.producers FOR ALL USING (is_admin());

-- RLS Policies for product categories  
CREATE POLICY "Categories viewable by everyone" ON public.product_categories FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage categories" ON public.product_categories FOR ALL USING (is_admin());

-- RLS Policies for products
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (is_admin());

-- RLS Policies for activity logs
CREATE POLICY "Admins can view activity logs" ON public.activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "System can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_producers_updated_at BEFORE UPDATE ON public.producers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if user has admin role
  IF is_admin() THEN
    INSERT INTO public.activity_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add activity logging triggers for key tables
CREATE TRIGGER log_organizations_activity AFTER INSERT OR UPDATE OR DELETE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();
CREATE TRIGGER log_profiles_activity AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();
CREATE TRIGGER log_animals_activity AFTER INSERT OR UPDATE OR DELETE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();
CREATE TRIGGER log_producers_activity AFTER INSERT OR UPDATE OR DELETE ON public.producers FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();
CREATE TRIGGER log_products_activity AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();