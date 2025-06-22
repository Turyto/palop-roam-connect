
-- Create the inventory table to track eSIM stock by country and carrier
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  carrier TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 0,
  threshold_low INTEGER NOT NULL DEFAULT 100,
  threshold_critical INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(country, carrier)
);

-- Enable RLS for inventory table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage inventory
CREATE POLICY "Admins can manage inventory" 
  ON public.inventory 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample inventory data (PALOP countries)
INSERT INTO public.inventory (country, carrier, available, threshold_low, threshold_critical) VALUES
  ('Cape Verde', 'CVMóvel', 245, 50, 20),
  ('Angola', 'Unitel', 89, 100, 25),
  ('Mozambique', 'Vodacom', 156, 50, 20),
  ('Guinea-Bissau', 'Orange', 23, 50, 15),
  ('São Tomé and Príncipe', 'CST', 78, 30, 10)
ON CONFLICT (country, carrier) DO NOTHING;

-- Create function to automatically decrease inventory when eSIM is provisioned
CREATE OR REPLACE FUNCTION public.decrease_inventory_on_provisioning()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrease inventory if provisioning status changed from non-completed to completed
  IF OLD.provisioning_status != 'completed' AND NEW.provisioning_status = 'completed' THEN
    -- Get order details to determine country/carrier (for now use a default mapping)
    -- In a real implementation, you'd have country/carrier info in the order
    UPDATE public.inventory 
    SET available = GREATEST(available - 1, 0),
        updated_at = NOW()
    WHERE country = COALESCE(
      CASE 
        WHEN NEW.order_id IS NOT NULL THEN 'Cape Verde'  -- Default for demo
        ELSE 'Cape Verde'
      END, 
      'Cape Verde'
    )
    AND carrier = COALESCE(
      CASE 
        WHEN NEW.order_id IS NOT NULL THEN 'CVMóvel'  -- Default for demo
        ELSE 'CVMóvel'
      END,
      'CVMóvel'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on esim_activations to automatically decrease inventory
DROP TRIGGER IF EXISTS trigger_decrease_inventory ON public.esim_activations;
CREATE TRIGGER trigger_decrease_inventory
  AFTER UPDATE ON public.esim_activations
  FOR EACH ROW
  EXECUTE FUNCTION public.decrease_inventory_on_provisioning();

-- Add updated_at trigger to inventory table
DROP TRIGGER IF EXISTS trigger_update_inventory_updated_at ON public.inventory;
CREATE TRIGGER trigger_update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
