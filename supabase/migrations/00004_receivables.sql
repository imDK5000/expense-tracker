-- Create Receivables table
CREATE TABLE public.receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;

-- Receivables Policies
CREATE POLICY "Users can SELECT their own receivables" ON public.receivables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can INSERT their own receivables" ON public.receivables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can UPDATE their own receivables" ON public.receivables FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can DELETE their own receivables" ON public.receivables FOR DELETE USING (auth.uid() = user_id);
