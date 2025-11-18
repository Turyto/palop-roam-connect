import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QRCode {
  id: string;
  order_id: string | null;
  user_id: string;
  esim_id: string | null;
  qr_image_url: string | null;
  activation_url: string;
  status: 'pending' | 'active' | 'revoked';
  created_at: string;
  updated_at: string;
  orders?: {
    plan_name: string;
    data_amount: string;
  } | null;
  profiles?: {
    email: string;
    full_name: string | null;
  } | null;
}

export const useQRCodes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: qrCodes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-qr-codes'],
    queryFn: async () => {
      console.log('Fetching QR codes...');
      
      // First, get all QR codes
      const { data: qrCodesData, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (qrError) {
        console.error('Error fetching QR codes:', qrError);
        throw qrError;
      }

      console.log('QR codes data:', qrCodesData);

      if (!qrCodesData || qrCodesData.length === 0) {
        return [];
      }

      // Get unique user IDs and order IDs
      const userIds = [...new Set(qrCodesData.map(qr => qr.user_id).filter(Boolean))];
      const orderIds = [...new Set(qrCodesData.map(qr => qr.order_id).filter(Boolean))];

      // Fetch profiles data
      let profilesData: any[] = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = data || [];
        }
      }

      // Fetch orders data
      let ordersData: any[] = [];
      if (orderIds.length > 0) {
        const { data, error: ordersError } = await supabase
          .from('orders')
          .select('id, plan_name, data_amount')
          .in('id', orderIds);
        
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
        } else {
          ordersData = data || [];
        }
      }

      // Combine the data
      const transformedData: QRCode[] = qrCodesData.map(qrCode => {
        const profile = profilesData.find(p => p.id === qrCode.user_id);
        const order = ordersData.find(o => o.id === qrCode.order_id);

        return {
          id: qrCode.id,
          order_id: qrCode.order_id,
          user_id: qrCode.user_id,
          esim_id: qrCode.esim_id,
          qr_image_url: qrCode.qr_image_url,
          activation_url: qrCode.activation_url,
          status: qrCode.status as 'pending' | 'active' | 'revoked',
          created_at: qrCode.created_at,
          updated_at: qrCode.updated_at,
          orders: order ? {
            plan_name: order.plan_name,
            data_amount: order.data_amount
          } : null,
          profiles: profile ? {
            email: profile.email,
            full_name: profile.full_name
          } : null,
        };
      });

      return transformedData;
    },
  });

  const regenerateQRMutation = useMutation({
    mutationFn: async (qrCodeId: string) => {
      console.log('Regenerating QR code:', qrCodeId);
      
      // First mark the old QR code as revoked
      const { error: revokeError } = await supabase
        .from('qr_codes')
        .update({ status: 'revoked' })
        .eq('id', qrCodeId);

      if (revokeError) {
        console.error('Error revoking QR code:', revokeError);
        throw revokeError;
      }

      // Get the original QR code data
      const { data: originalQR, error: fetchError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrCodeId)
        .single();

      if (fetchError) {
        console.error('Error fetching original QR code:', fetchError);
        throw fetchError;
      }

      // Create a new QR code
      const newActivationUrl = `https://esim.activate/${originalQR.order_id}?t=${Date.now()}`;
      
      const { data: newQR, error: createError } = await supabase
        .from('qr_codes')
        .insert({
          order_id: originalQR.order_id,
          user_id: originalQR.user_id,
          esim_id: originalQR.esim_id,
          activation_url: newActivationUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating new QR code:', createError);
        throw createError;
      }

      return newQR;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-qr-codes'] });
      toast({
        title: "QR Code Regenerated",
        description: "A new QR code has been generated successfully.",
      });
    },
    onError: (error) => {
      console.error('QR code regeneration error:', error);
      toast({
        title: "Regeneration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ qrCodeId, status }: { qrCodeId: string; status: 'pending' | 'active' | 'revoked' }) => {
      console.log('Updating QR code status:', qrCodeId, status);
      
      const { data, error } = await supabase
        .from('qr_codes')
        .update({ status })
        .eq('id', qrCodeId)
        .select()
        .single();

      if (error) {
        console.error('Error updating QR code status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-qr-codes'] });
      toast({
        title: "Status Updated",
        description: "QR code status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('QR code status update error:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    qrCodes,
    isLoading,
    error,
    refetch,
    regenerateQR: regenerateQRMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isRegenerating: regenerateQRMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending
  };
};
