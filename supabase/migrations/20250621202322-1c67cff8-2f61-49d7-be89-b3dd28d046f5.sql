
-- Extend esim_activations table with provisioning fields
ALTER TABLE public.esim_activations 
ADD COLUMN IF NOT EXISTS provisioning_status TEXT CHECK (
  provisioning_status IN ('pending', 'in_progress', 'completed', 'failed')
) DEFAULT 'pending';

ALTER TABLE public.esim_activations 
ADD COLUMN IF NOT EXISTS activation_url TEXT;

ALTER TABLE public.esim_activations 
ADD COLUMN IF NOT EXISTS provisioning_log JSONB;

-- Create carrier_integrations table
CREATE TABLE IF NOT EXISTS public.carrier_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  endpoint_url TEXT,
  api_key TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add some sample carrier data
INSERT INTO public.carrier_integrations (name, endpoint_url, is_active)
VALUES 
  ('Airalo', 'https://api.airalo.com/v2/esims', true),
  ('eSIM Access', 'https://api.esimaccess.com/provision', true),
  ('Global eSIM', 'https://api.globaleSIM.io/activate', false)
ON CONFLICT DO NOTHING;

-- Add some sample esim_activations data for testing
INSERT INTO public.esim_activations (
  order_id, 
  user_id, 
  status, 
  provisioning_status,
  activation_url,
  provisioning_log
)
SELECT 
  o.id,
  o.user_id,
  'pending',
  CASE 
    WHEN random() < 0.3 THEN 'completed'
    WHEN random() < 0.6 THEN 'in_progress'
    WHEN random() < 0.8 THEN 'failed'
    ELSE 'pending'
  END,
  'https://esim.activate/' || o.id || '?t=' || extract(epoch from now()),
  CASE 
    WHEN random() < 0.5 THEN '{"attempts": 1, "last_error": null}'::jsonb
    ELSE '{"attempts": 2, "last_error": "Network timeout"}'::jsonb
  END
FROM public.orders o
WHERE NOT EXISTS (
  SELECT 1 FROM public.esim_activations ea WHERE ea.order_id = o.id
)
LIMIT 10;

-- Enable RLS on carrier_integrations
ALTER TABLE public.carrier_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for carrier_integrations (admin only)
CREATE POLICY "Admins can manage carrier integrations"
ON public.carrier_integrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policy for esim_activations (admin only)
CREATE POLICY "Admins can manage esim activations"
ON public.esim_activations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Enable RLS on esim_activations
ALTER TABLE public.esim_activations ENABLE ROW LEVEL SECURITY;
