
-- Create the esim_packages table to map our plans to eSIM Access package IDs
CREATE TABLE public.esim_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT NOT NULL UNIQUE,
  esim_access_package_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.esim_packages ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage eSIM packages
CREATE POLICY "Admins can manage esim packages" 
  ON public.esim_packages 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::app_role
  ));

-- Allow public read access for plan mapping during order creation
CREATE POLICY "Public can view esim packages" 
  ON public.esim_packages 
  FOR SELECT 
  USING (true);

-- Insert the mappings for the real eSIM plans
INSERT INTO public.esim_packages (plan_id, esim_access_package_id, plan_name) VALUES
('palop-neighbours1', 'algeria-100mb-7days', 'Palop Neighbours1'),
('palop-neighbours2', 'africa-1gb-7days', 'Palop Neighbours2');
