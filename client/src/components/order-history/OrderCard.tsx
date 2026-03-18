import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import OrderStatus from "./OrderStatus";
import OrderActions from "./OrderActions";
import OrderDetails from "./OrderDetails";
import { useLanguage } from "@/contexts/language";

interface OrderCardProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  isExpanded: boolean;
  onToggleExpansion: (orderId: string) => void;
  onDownloadESIM: (order: any) => void;
  onResendEmail: (orderId: string) => void;
  onTopUp?: (order: any) => void;
}

const OrderCard = ({
  order,
  qrCode,
  canDownload,
  isExpanded,
  onToggleExpansion,
  onDownloadESIM,
  onResendEmail,
  onTopUp
}: OrderCardProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  const validityText = o.validFor.replace('{days}', String(order.duration_days ?? '—'));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-snug truncate">
              {order.plan_name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
            </div>
            {order.duration_days && (
              <div className="mt-1.5 text-xs text-palop-green font-medium">{validityText}</div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-gray-900">€{order.price}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {order.data_amount}{order.duration_days ? ` · ${order.duration_days} days` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <OrderStatus order={order} qrCode={qrCode} />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(order.id)}
            className="text-gray-500 hover:text-gray-700 text-xs h-7 px-2"
            data-testid={`button-toggle-order-${order.id}`}
          >
            {isExpanded ? (
              <><ChevronUp className="h-3.5 w-3.5 mr-1" />{o.details}</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5 mr-1" />{o.details}</>
            )}
          </Button>
        </div>

        <OrderActions
          order={order}
          qrCode={qrCode}
          canDownload={canDownload}
          onDownloadESIM={onDownloadESIM}
          onResendEmail={onResendEmail}
          onTopUp={onTopUp}
          variant="compact"
        />

        <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex flex-wrap gap-4">
          <span>
            <span className="font-medium text-gray-500">{o.orderId}:</span>{' '}
            <span className="font-mono" title={order.id}>{order.id.slice(0, 8)}…</span>
          </span>
          {order.esim_delivered_at && (
            <span>
              <span className="font-medium text-gray-500">{o.esimDeliveredAt}:</span>{' '}
              {format(new Date(order.esim_delivered_at), 'MMM dd, yyyy HH:mm')}
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-5">
          <OrderDetails
            order={order}
            qrCode={qrCode}
            canDownload={canDownload}
            onDownloadESIM={onDownloadESIM}
            onResendEmail={onResendEmail}
            onTopUp={onTopUp}
          />
        </div>
      )}
    </div>
  );
};

export default OrderCard;
