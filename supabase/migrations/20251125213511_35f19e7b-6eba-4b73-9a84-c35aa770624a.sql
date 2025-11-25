-- Create user_carts table to store cart items for logged-in users
CREATE TABLE public.user_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  max_quantity INTEGER,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  animal_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, animal_id)
);

-- Enable RLS
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cart
CREATE POLICY "Users can view own cart"
ON public.user_carts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert into their own cart
CREATE POLICY "Users can insert into own cart"
ON public.user_carts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
ON public.user_carts
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete from their own cart
CREATE POLICY "Users can delete from own cart"
ON public.user_carts
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_carts_updated_at
BEFORE UPDATE ON public.user_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();