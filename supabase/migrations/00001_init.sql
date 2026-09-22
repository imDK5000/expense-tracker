-- Create EMIs table
CREATE TABLE public.emis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    principal_amount NUMERIC,
    monthly_amount NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    tenure_months INTEGER NOT NULL,
    interest_rate NUMERIC,
    notes TEXT
);

-- Create Expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT,
    date DATE NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.emis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- EMIs Policies
CREATE POLICY "Users can SELECT their own emis" ON public.emis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can INSERT their own emis" ON public.emis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can UPDATE their own emis" ON public.emis FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can DELETE their own emis" ON public.emis FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can SELECT their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can INSERT their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can UPDATE their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can DELETE their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);
