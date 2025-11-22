-- Add birth_date column to animals table
ALTER TABLE public.animals 
ADD COLUMN birth_date DATE;

-- Add a comment to describe the column
COMMENT ON COLUMN public.animals.birth_date IS 'Birth date of the animal for calculating age';