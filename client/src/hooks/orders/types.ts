
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Order = Tables<'orders'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type ESIMActivation = Tables<'esim_activations'>;

export interface CreateOrderData {
  plan_id: string;
  plan_name: string;
  data_amount: string;
  duration_days: number;
  price: number;
  currency?: string;
  payment_intent_id?: string;
  customerEmail?: string;
}

export interface UpdateOrderData {
  orderId: string;
  status?: string;
  paymentStatus?: string;
  paymentIntentId?: string;
}
