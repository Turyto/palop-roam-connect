
-- Drop the existing admin-only policy
DROP POLICY IF EXISTS "Admins can view all QR codes" ON public.qr_codes;

-- Create new policies for customers and admins
CREATE POLICY "Customers can view their own QR codes" 
  ON public.qr_codes 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all QR codes" 
  ON public.qr_codes 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to insert, update, delete QR codes
CREATE POLICY "Admins can manage QR codes" 
  ON public.qr_codes 
  FOR INSERT, UPDATE, DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
