-- Add notes column to expenses
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS notes TEXT;
