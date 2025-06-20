
-- Add foreign key constraints that were missing
ALTER TABLE public.qr_codes 
ADD CONSTRAINT qr_codes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also add the foreign key for order_id if it doesn't exist
ALTER TABLE public.qr_codes 
ADD CONSTRAINT qr_codes_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Update the existing sample data to use proper user IDs that exist in profiles table
UPDATE public.qr_codes 
SET user_id = (SELECT id FROM public.profiles LIMIT 1)
WHERE user_id NOT IN (SELECT id FROM public.profiles);
