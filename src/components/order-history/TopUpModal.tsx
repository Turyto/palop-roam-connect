
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTopUpOrders } from "@/hooks/useTopUpOrders";
import { Zap, Clock, Wifi } from "lucide-react";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const TopUpModal = ({ isOpen, onClose, order }: TopUpModalProps) => {
  const { topUpOptions, optionsLoading, createTopUpOrder, isCreatingTopUp } = useTopUpOrders();

  const handleTopUpPurchase = (optionId: string) => {
    createTopUpOrder({
      parentOrderId: order.id,
      optionId
    });
    onClose();
  };

  const getTopUpIcon = (type: string) => {
    switch (type) {
      case 'data':
        return <Wifi className="h-5 w-5" />;
      case 'validity':
        return <Clock className="h-5 w-5" />;
      case 'both':
        return <Zap className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getTopUpColor = (type: string) => {
    switch (type) {
      case 'data':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'validity':
        return 'bg-green-500 hover:bg-green-600';
      case 'both':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'data':
        return 'Data Boost';
      case 'validity':
        return 'Time Extension';
      case 'both':
        return 'Combo Deal';
      default:
        return 'Top-Up';
    }
  };

  if (optionsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Top-Up Options...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-lg">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-palop-green" />
            Top-Up Your eSIM
          </DialogTitle>
          <DialogDescription>
            Add more data or extend the validity of your <strong>{order.plan_name}</strong> plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Current Plan Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Plan:</span> {order.plan_name}
              </div>
              <div>
                <span className="text-blue-700">Data:</span> {order.data_amount}
              </div>
              <div>
                <span className="text-blue-700">Duration:</span> {order.duration_days} days
              </div>
              <div>
                <span className="text-blue-700">Original Price:</span> €{order.price}
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {topUpOptions.map((option) => (
              <Card key={option.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-white ${getTopUpColor(option.type)}`}>
                        {getTopUpIcon(option.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{option.name}</CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{getTypeLabel(option.type)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-gray-600">
                      {option.data_amount && (
                        <div>
                          <span className="font-medium">Data:</span> +{option.data_amount}
                        </div>
                      )}
                      {option.validity_days && (
                        <div>
                          <span className="font-medium">Validity:</span> +{option.validity_days} days
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold">€{option.price}</div>
                        <div className="text-sm text-gray-500">{option.currency}</div>
                      </div>
                      <Button
                        onClick={() => handleTopUpPurchase(option.id)}
                        disabled={isCreatingTopUp}
                        className={`${getTopUpColor(option.type)} text-white`}
                      >
                        {isCreatingTopUp ? 'Processing...' : 'Purchase'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpModal;
