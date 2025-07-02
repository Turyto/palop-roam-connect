
-- Add missing columns to orders table for eSIM integration
ALTER TABLE public.orders 
ADD COLUMN esim_package_id text,
ADD COLUMN esim_status text,
ADD COLUMN esim_order_id text;
