
-- Add INSERT policy for esim_activations table to allow users to create their own records
CREATE POLICY "Users can create their own eSIM activations" 
  ON public.esim_activations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
