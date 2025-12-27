-- Create partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active partners
CREATE POLICY "Anyone can view active partners"
ON public.partners
FOR SELECT
USING (active = true);

-- Admins can manage partners
CREATE POLICY "Admins can manage partners"
ON public.partners
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Insert mock partners
INSERT INTO public.partners (name, logo_url, website_url, display_order) VALUES
('Royal Canin', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Royal-Canin-Logo.svg/1200px-Royal-Canin-Logo.svg.png', 'https://royalcanin.com', 1),
('Purina', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Purina_logo.svg/1200px-Purina_logo.svg.png', 'https://purina.pl', 2),
('Pedigree', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Pedigree_logo.svg/1200px-Pedigree_logo.svg.png', 'https://pedigree.pl', 3),
('Whiskas', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Whiskas_logo.svg/1200px-Whiskas_logo.svg.png', 'https://whiskas.pl', 4),
('Hill''s', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Hill%27s_Pet_Nutrition_logo.svg/1200px-Hill%27s_Pet_Nutrition_logo.svg.png', 'https://hillspet.pl', 5);