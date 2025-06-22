
-- Create top-up orders table to track recharge purchases
CREATE TABLE public.topup_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  topup_type TEXT NOT NULL CHECK (topup_type IN ('data', 'validity', 'both')),
  data_amount TEXT, -- e.g. '1GB', '3GB', '5GB'
  validity_days INTEGER, -- e.g. 7, 30
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for top-up orders
ALTER TABLE public.topup_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for top-up orders
CREATE POLICY "Users can view their own top-up orders" 
  ON public.topup_orders 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own top-up orders" 
  ON public.topup_orders 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all top-up orders" 
  ON public.topup_orders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger for top-up orders
CREATE TRIGGER update_topup_orders_updated_at 
  BEFORE UPDATE ON public.topup_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create top-up options reference table for standardized pricing
CREATE TABLE public.topup_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('data', 'validity', 'both')),
  name TEXT NOT NULL, -- e.g. '1GB Data Boost', '7 Days Extension'
  description TEXT,
  data_amount TEXT, -- e.g. '1GB', '3GB', '5GB'
  validity_days INTEGER, -- e.g. 7, 30
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default top-up options
INSERT INTO public.topup_options (type, name, description, data_amount, price, sort_order) VALUES
('data', '1GB Data Boost', 'Add 1GB to your existing plan', '1GB', 5.00, 1),
('data', '3GB Data Boost', 'Add 3GB to your existing plan', '3GB', 12.00, 2),
('data', '5GB Data Boost', 'Add 5GB to your existing plan', '5GB', 18.00, 3);

INSERT INTO public.topup_options (type, name, description, validity_days, price, sort_order) VALUES
('validity', '7 Days Extension', 'Extend your plan by 7 days', 7, 3.00, 4),
('validity', '30 Days Extension', 'Extend your plan by 30 days', 30, 10.00, 5);

INSERT INTO public.topup_options (type, name, description, data_amount, validity_days, price, sort_order) VALUES
('both', '2GB + 14 Days Combo', 'Add 2GB data and extend by 14 days', '2GB', 14, 15.00, 6);

-- Add updated_at trigger for top-up options
CREATE TRIGGER update_topup_options_updated_at 
  BEFORE UPDATE ON public.topup_options 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
