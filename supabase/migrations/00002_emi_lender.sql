-- Add lender/vendor columns to emis table
-- lender_name: human-readable lender name entered by the user (e.g. "Moneyview")
-- lender_logo_domain: resolved domain for Google favicon fetch (e.g. "moneyview.in")
ALTER TABLE public.emis
  ADD COLUMN IF NOT EXISTS lender_name TEXT,
  ADD COLUMN IF NOT EXISTS lender_logo_domain TEXT;
