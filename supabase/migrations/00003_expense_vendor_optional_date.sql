-- Make date optional and add vendor columns to expenses table
ALTER TABLE public.expenses ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS vendor_logo_domain TEXT;
