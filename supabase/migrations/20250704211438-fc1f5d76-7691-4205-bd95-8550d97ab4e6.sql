
-- Drop the old inventory tables as they don't fit the new business model
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.plan_inventory CASCADE;

-- Create plans catalog table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  coverage TEXT[] DEFAULT '{}', -- Countries covered
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  retail_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplier rates table
CREATE TABLE public.supplier_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  wholesale_cost DECIMAL(10,2) NOT NULL,
  supplier_plan_id TEXT, -- External supplier's plan ID
  supplier_link TEXT,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing rules table
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_markup DECIMAL(5,2) DEFAULT 50.0, -- Default 50% markup
  margin_alert_threshold DECIMAL(5,2) DEFAULT 20.0, -- Alert if margin below 20%
  exceptions JSONB DEFAULT '{}', -- Plan-specific or tag-specific rules
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing rules
INSERT INTO public.pricing_rules (global_markup, margin_alert_threshold) 
VALUES (50.0, 20.0);

-- Enable RLS on all tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admins only
CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

CREATE POLICY "Admins can manage supplier rates" ON public.supplier_rates FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::app_role));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_rates_updated_at BEFORE UPDATE ON public.supplier_rates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.plans (name, description, tags, coverage, retail_price) VALUES
('PALOP Essential 5GB', '5GB data plan for PALOP countries', ARRAY['PALOP', 'Essential'], ARRAY['Cape Verde', 'Angola', 'Mozambique'], 29.99),
('Europe Travel 10GB', '10GB data plan for Europe', ARRAY['Europe', 'Travel'], ARRAY['Portugal', 'Spain', 'France', 'Germany'], 49.99),
('Global Roaming 20GB', '20GB worldwide data plan', ARRAY['Global', 'Premium'], ARRAY['Worldwide'], 89.99);

-- Insert sample supplier rates
INSERT INTO public.supplier_rates (supplier_name, plan_id, wholesale_cost, supplier_plan_id) 
SELECT 'AirHub', id, 19.99, 'AIRHUB_PALOP_5GB' FROM public.plans WHERE name = 'PALOP Essential 5GB';

INSERT INTO public.supplier_rates (supplier_name, plan_id, wholesale_cost, supplier_plan_id) 
SELECT 'eSIM Access', id, 21.99, 'ESIM_PALOP_5GB' FROM public.plans WHERE name = 'PALOP Essential 5GB';

INSERT INTO public.supplier_rates (supplier_name, plan_id, wholesale_cost, supplier_plan_id) 
SELECT 'Airalo', id, 34.99, 'AIRALO_EUR_10GB' FROM public.plans WHERE name = 'Europe Travel 10GB';
