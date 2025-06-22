
export interface ESIMActivation {
  id: string;
  order_id: string;
  user_id: string;
  status: 'pending' | 'active' | 'delivered' | 'expired';
  provisioning_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  activation_url: string | null;
  activated_at: string | null;
  delivered_at: string | null;
  expires_at: string | null;
  provisioning_log: any;
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
