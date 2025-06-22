
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface CustomerQRCode {
  id: string;
  order_id: string;
  activation_url: string;
  status: 'pending' | 'active' | 'revoked';
  created_at: string;
}

export const useCustomerQRCodes = () => {
  const { user } = useAuth();

  const { data: qrCodes = [], isLoading, error } = useQuery({
    queryKey: ['customer-qr-codes', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching customer QR codes...');
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id, order_id, activation_url, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer QR codes:', error);
        throw error;
      }

      return data as CustomerQRCode[];
    },
    enabled: !!user,
  });

  return {
    qrCodes,
    isLoading,
    error
  };
};
