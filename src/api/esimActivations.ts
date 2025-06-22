
import { supabase } from '@/integrations/supabase/client';
import type { ESIMActivation } from '@/types/esimActivations';

export const fetchESIMActivations = async (): Promise<ESIMActivation[]> => {
  console.log('Fetching eSIM activations...');
  
  // First, get all eSIM activations
  const { data: activationsData, error: activationsError } = await supabase
    .from('esim_activations')
    .select('*')
    .order('created_at', { ascending: false });

  if (activationsError) {
    console.error('Error fetching eSIM activations:', activationsError);
    throw activationsError;
  }

  console.log('eSIM activations data:', activationsData);

  if (!activationsData || activationsData.length === 0) {
    return [];
  }

  // Get unique user IDs and order IDs
  const userIds = [...new Set(activationsData.map(a => a.user_id).filter(Boolean))];
  const orderIds = [...new Set(activationsData.map(a => a.order_id).filter(Boolean))];

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
  const transformedData: ESIMActivation[] = activationsData.map(activation => {
    const profile = profilesData.find(p => p.id === activation.user_id);
    const order = ordersData.find(o => o.id === activation.order_id);

    return {
      id: activation.id,
      order_id: activation.order_id,
      user_id: activation.user_id,
      status: activation.status as 'pending' | 'active' | 'delivered' | 'expired',
      provisioning_status: activation.provisioning_status as 'pending' | 'in_progress' | 'completed' | 'failed',
      activation_url: activation.activation_url,
      activated_at: activation.activated_at,
      delivered_at: activation.delivered_at,
      expires_at: activation.expires_at,
      provisioning_log: activation.provisioning_log,
      created_at: activation.created_at,
      updated_at: activation.updated_at,
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
};

export const retryProvisioningAPI = async (activationId: string) => {
  console.log('Retrying provisioning for activation:', activationId);
  
  const { data, error } = await supabase
    .from('esim_activations')
    .update({ 
      provisioning_status: 'in_progress',
      provisioning_log: {
        attempts: 1,
        last_attempt: new Date().toISOString(),
        status: 'retrying'
      }
    })
    .eq('id', activationId)
    .select()
    .single();

  if (error) {
    console.error('Error retrying provisioning:', error);
    throw error;
  }

  return data;
};

export const markAsCompleteAPI = async (activationId: string) => {
  console.log('Marking activation as complete:', activationId);
  
  const { data, error } = await supabase
    .from('esim_activations')
    .update({ 
      provisioning_status: 'completed',
      status: 'active',
      delivered_at: new Date().toISOString(),
      provisioning_log: {
        completed_manually: true,
        completed_at: new Date().toISOString()
      }
    })
    .eq('id', activationId)
    .select()
    .single();

  if (error) {
    console.error('Error marking as complete:', error);
    throw error;
  }

  return data;
};

export const bulkProvisionAPI = async () => {
  console.log('Starting bulk provisioning...');
  
  // Get all pending activations
  const { data: pendingActivations, error: fetchError } = await supabase
    .from('esim_activations')
    .select('id')
    .eq('provisioning_status', 'pending');

  if (fetchError) throw fetchError;

  if (!pendingActivations || pendingActivations.length === 0) {
    return { success: 0, failed: 0, message: 'No pending activations found' };
  }

  // Update all pending to in_progress
  const { error: updateError } = await supabase
    .from('esim_activations')
    .update({ 
      provisioning_status: 'in_progress',
      provisioning_log: {
        bulk_provision: true,
        started_at: new Date().toISOString()
      }
    })
    .eq('provisioning_status', 'pending');

  if (updateError) throw updateError;

  return { 
    success: pendingActivations.length, 
    failed: 0, 
    message: `Started bulk provisioning for ${pendingActivations.length} activations` 
  };
};
