
-- Create a new table for QR codes
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  esim_id UUID REFERENCES esim_activations(id) ON DELETE SET NULL,
  qr_image_url TEXT,
  activation_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'revoked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can view all QR codes" 
  ON public.qr_codes 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger to update updated_at column
CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.qr_codes (order_id, user_id, activation_url, qr_image_url, status) 
SELECT 
  o.id,
  o.user_id,
  'https://esim.activate/' || o.id,
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  CASE 
    WHEN o.status = 'completed' THEN 'active'
    WHEN o.status = 'failed' THEN 'revoked'
    ELSE 'pending'
  END
FROM public.orders o
LIMIT 10;
