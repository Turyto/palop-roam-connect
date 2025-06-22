
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import OrderStatus from "./OrderStatus";
import OrderActions from "./OrderActions";
import OrderDetails from "./OrderDetails";

interface OrderCardProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  isExpanded: boolean;
  onToggleExpansion: (orderId: string) => void;
  onDownloadESIM: (order: any) => void;
  onResendEmail: (orderId: string) => void;
}

const OrderCard = ({ 
  order, 
  qrCode, 
  canDownload, 
  isExpanded, 
  onToggleExpansion, 
  onDownloadESIM, 
  onResendEmail 
}: OrderCardProps) => {
  const getValidityInfo = (order: any) => {
    return `Valid for ${order.duration_days} days from activation`;
  };

  console.log(`Order ${order.id}: status=${order.status}, payment_status=${order.payment_status}, esim_delivered_at=${order.esim_delivered_at}, qrCode=${!!qrCode}, canDownload=${canDownload}`);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {order.plan_name}
              <span className="text-sm font-normal text-gray-500">
                🇨🇻 Cape Verde (CVMóvel)
              </span>
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(order.created_at), 'MMM dd, yyyy')}
            </CardDescription>
            <div className="mt-2 text-sm text-blue-600">
              {getValidityInfo(order)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">€{order.price}</div>
            <div className="text-sm text-gray-500">{order.data_amount} • {order.duration_days} days</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2 items-center">
            <OrderStatus order={order} qrCode={qrCode} />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpansion(order.id)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Details
            </Button>
          </div>
        </div>

        <OrderActions
          order={order}
          qrCode={qrCode}
          canDownload={canDownload}
          onDownloadESIM={onDownloadESIM}
          onResendEmail={onResendEmail}
          variant="compact"
        />
        
        <div className="text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Order ID:</span> 
              <span className="font-mono ml-1" title={order.id}>
                {order.id.slice(0, 8)}...
              </span>
            </div>
            {order.completed_at && (
              <div>
                <span className="font-medium">Completed:</span> {format(new Date(order.completed_at), 'MMM dd, yyyy')}
              </div>
            )}
            {order.esim_delivered_at && (
              <div className="col-span-2">
                <span className="font-medium">eSIM Delivered:</span> {format(new Date(order.esim_delivered_at), 'MMM dd, yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>

        {isExpanded && (
          <OrderDetails
            order={order}
            qrCode={qrCode}
            canDownload={canDownload}
            onDownloadESIM={onDownloadESIM}
            onResendEmail={onResendEmail}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
