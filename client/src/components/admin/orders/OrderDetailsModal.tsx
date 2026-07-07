
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, Package, Euro, Wifi, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminOrder {
  id: string;
  user_id: string;
  plan_name: string;
  data_amount: string;
  duration_days: number;
  price: number;
  currency: string;
  status: string;
  payment_status: string;
  payment_intent_id: string | null;
  customer_email: string | null;
  created_at: string;
  esim_delivered_at: string | null;
  esim_status: string | null;
  esim_order_id: string | null;
  esim_failure_reason?: string | null;
  referral_code: string | null;
}

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const getPlanIcon = (planName: string) => {
  const name = planName.toLowerCase();
  if (name.includes('arrival')) return '🛬';
  if (name.includes('essential')) return '📶';
  if (name.includes('comfort')) return '🌐';
  if (name.includes('freedom')) return '🚀';
  return '📦';
};

const OrderDetailsModal = ({ order, isOpen, onClose }: OrderDetailsModalProps) => {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [resentDetails, setResentDetails] = useState<{
    lpaCode: string | null;
    iccid: string | null;
    webUrl: string | null;
    qrImageUrl: string | null;
  } | null>(null);

  if (!order) return null;

  const handleResendEmail = async () => {
    const email = order.customer_email;
    if (!email) {
      toast({
        title: "No email on file",
        description: "This order has no customer email address. Cannot send email.",
        variant: "destructive",
      });
      return;
    }
    setIsResending(true);
    setResentDetails(null);
    try {
      const { data, error } = await supabase.functions.invoke('resend-esim-email', {
        body: { orderId: order.id },
      });

      if (error || !data?.success) {
        const msg = data?.error || error?.message || "Failed to send email";
        toast({
          title: "Failed to send email",
          description: msg,
          variant: "destructive",
        });
      } else {
        if (data.esimDetails) {
          setResentDetails(data.esimDetails);
        }
        toast({
          title: "Sign-in link sent!",
          description: `A secure sign-in link has been emailed to ${email}.`,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({
        title: "Failed to send email",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' | 'esim') => {
    const colors: Record<string, Record<string, string>> = {
      order: {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        in_progress: "bg-blue-100 text-blue-800 border-blue-200",
        completed: "bg-green-100 text-green-800 border-green-200",
        failed: "bg-red-100 text-red-800 border-red-200",
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        confirmed: "bg-green-100 text-green-800 border-green-200",
        succeeded: "bg-green-100 text-green-800 border-green-200",
        failed: "bg-red-100 text-red-800 border-red-200",
      },
      esim: {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        provisioned: "bg-blue-100 text-blue-800 border-blue-200",
        active: "bg-green-100 text-green-800 border-green-200",
        delivered: "bg-green-100 text-green-800 border-green-200",
        failed: "bg-red-100 text-red-800 border-red-200",
      },
    };

    return (
      <Badge className={`${(colors[type] ?? {})[status] ?? "bg-gray-100 text-gray-800 border-gray-200"} border`}>
        {status}
      </Badge>
    );
  };

  const getEsimBadge = () => {
    if (order.esim_status === 'delivered' || order.esim_delivered_at) {
      return getStatusBadge('delivered', 'esim');
    }
    if (order.esim_order_id) {
      return getStatusBadge('provisioned', 'esim');
    }
    if (order.esim_status === 'failed') {
      return getStatusBadge('failed', 'esim');
    }
    return getStatusBadge('pending', 'esim');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-palop-blue to-palop-green text-white p-6 -m-6 mb-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getPlanIcon(order.plan_name)}</span>
              <div>
                <DialogTitle className="text-xl font-bold text-white">{order.plan_name}</DialogTitle>
                <p className="text-white/80 text-sm mt-1">Order #{order.id.slice(0, 8)}…</p>
              </div>
            </div>
            <div>{getStatusBadge(order.status, 'order')}</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-palop-blue" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date
                  </label>
                  <p className="font-medium text-sm mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Euro className="h-3 w-3" /> Total Price
                  </label>
                  <p className="font-medium text-sm mt-0.5">{order.price} {order.currency}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <User className="h-3 w-3" /> Customer Email
                  </label>
                  <p className="font-medium text-sm mt-0.5">
                    {order.customer_email ?? <span className="text-gray-400 italic text-xs">no email on file</span>}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Wifi className="h-3 w-3" /> Data Amount
                  </label>
                  <p className="font-medium text-sm mt-0.5">{order.data_amount}</p>
                </div>
                {order.referral_code && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500">Referral Code</label>
                    <p className="font-mono font-medium text-palop-green text-sm mt-0.5">{order.referral_code}</p>
                  </div>
                )}
                {order.esim_order_id && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500">eSIM Order ID</label>
                    <p className="font-mono text-xs text-gray-600 mt-0.5 break-all">{order.esim_order_id}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Overview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Status Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <label className="text-xs font-medium text-gray-500">Order Status</label>
                <div className="mt-2">{getStatusBadge(order.status, 'order')}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <label className="text-xs font-medium text-gray-500">Payment Status</label>
                <div className="mt-2">{getStatusBadge(order.payment_status, 'payment')}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <label className="text-xs font-medium text-gray-500">eSIM Status</label>
                <div className="mt-2">{getEsimBadge()}</div>
              </div>
            </div>
          </div>

          {/* Provisioning failure reason — why the supplier order failed */}
          {order.esim_status === 'failed' && order.esim_failure_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" data-testid="text-failure-reason">
              <p className="text-sm font-semibold text-red-800 mb-1">Provisioning failure reason</p>
              <p className="text-xs text-red-700 break-all font-mono">{order.esim_failure_reason}</p>
            </div>
          )}

          {/* eSIM details panel shown after successful resend */}
          {resentDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-green-800">Sign-in link sent — eSIM details for admin reference:</p>
              {resentDetails.iccid && (
                <p className="text-xs text-green-700"><span className="font-medium">ICCID:</span> {resentDetails.iccid}</p>
              )}
              {resentDetails.lpaCode && (
                <p className="text-xs text-green-700 break-all"><span className="font-medium">LPA Code:</span> {resentDetails.lpaCode}</p>
              )}
              {resentDetails.webUrl && (
                <p className="text-xs text-green-700 break-all"><span className="font-medium">Activation URL:</span> {resentDetails.webUrl}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleResendEmail}
              disabled={isResending || !order.customer_email}
              title={!order.customer_email ? "No customer email on this order" : "Send magic link to customer"}
              data-testid="button-resend-esim-email"
            >
              {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Resend eSIM Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
