-- Add customer_email column to orders table
-- This stores the customer's email directly on the order row,
-- enabling admin visibility for both guest and registered user orders.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
