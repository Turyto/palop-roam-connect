
-- Add plan-based inventory tracking
-- Create a new table for plan inventory
CREATE TABLE IF NOT EXISTS public.plan_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL UNIQUE,
  plan_name TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 0,
  threshold_low INTEGER NOT NULL DEFAULT 50,
  threshold_critical INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for plan_inventory table
ALTER TABLE public.plan_inventory ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage plan inventory
CREATE POLICY "Admins can manage plan inventory" 
  ON public.plan_inventory 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert initial plan inventory data
INSERT INTO public.plan_inventory (plan_id, plan_name, available, threshold_low, threshold_critical) VALUES
  ('lite', 'Lite', 150, 50, 15),
  ('core', 'Core', 200, 60, 20),
  ('plus', 'Plus', 100, 40, 12)
ON CONFLICT (plan_id) DO NOTHING;

-- Create function to automatically decrease plan inventory when order is completed
CREATE OR REPLACE FUNCTION public.decrease_plan_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrease inventory if order status changed to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    UPDATE public.plan_inventory 
    SET available = GREATEST(available - 1, 0),
        updated_at = NOW()
    WHERE plan_id = NEW.plan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on orders to automatically decrease plan inventory
DROP TRIGGER IF EXISTS trigger_decrease_plan_inventory ON public.orders;
CREATE TRIGGER trigger_decrease_plan_inventory
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.decrease_plan_inventory_on_order();

-- Add updated_at trigger to plan_inventory table
DROP TRIGGER IF EXISTS trigger_update_plan_inventory_updated_at ON public.plan_inventory;
CREATE TRIGGER trigger_update_plan_inventory_updated_at
  BEFORE UPDATE ON public.plan_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
