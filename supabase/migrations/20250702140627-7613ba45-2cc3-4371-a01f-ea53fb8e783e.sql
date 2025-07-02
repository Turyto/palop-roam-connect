
-- Add eSIM-related columns to the orders table
ALTER TABLE public.orders 
ADD COLUMN esim_order_id TEXT,
ADD COLUMN esim_package_id TEXT,
ADD COLUMN esim_status TEXT DEFAULT 'pending';

-- Create a table to store eSIM Access package mappings
CREATE TABLE public.esim_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  esim_access_package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  data_amount TEXT NOT NULL,
  validity_days INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id)
);

-- Add RLS policies for esim_packages table
ALTER TABLE public.esim_packages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read esim packages (needed for plan selection)
CREATE POLICY "Anyone can view active esim packages" 
  ON public.esim_packages 
  FOR SELECT 
  USING (is_active = true);

-- Only admins can manage esim packages
CREATE POLICY "Admins can manage esim packages" 
  ON public.esim_packages 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::app_role
  ));

-- Update the esim_activations table to include download URL and QR code data
ALTER TABLE public.esim_activations 
ADD COLUMN download_url TEXT,
ADD COLUMN qr_code_data TEXT;

-- Insert sample eSIM package mappings based on existing plans
INSERT INTO public.esim_packages (plan_id, plan_name, esim_access_package_id, package_name, data_amount, validity_days, price, currency) VALUES
('lite', 'Lite', 'cv-1gb-7d', 'Cape Verde 1GB 7 Days', '1-2 GB', 7, 6.00, 'EUR'),
('core', 'Core', 'cv-3gb-30d', 'Cape Verde 3GB 30 Days', '3-5 GB', 30, 12.50, 'EUR'),
('plus', 'Plus', 'cv-10gb-30d', 'Cape Verde 10GB 30 Days', '10 GB', 30, 27.50, 'EUR'),
('ngo', 'NGO Pack', 'cv-15gb-60d', 'Cape Verde 15GB 60 Days', '10+ GB', 60, 35.00, 'EUR'),
('local-cplp', 'Local CPLP', 'cv-5gb-30d', 'Cape Verde 5GB 30 Days', '3-5 GB', 22, 7.50, 'EUR');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_esim_packages_updated_at
  BEFORE UPDATE ON public.esim_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
