
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTopUpOrders } from "@/hooks/useTopUpOrders";
import { Zap, Clock, Wifi, CreditCard, ArrowLeft, Shield } from "lucide-react";
import { useState } from "react";

interface TopUpCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const TopUpCheckoutModal = ({ isOpen, onClose, order }: TopUpCheckoutModalProps) => {
  const { topUpOptions, optionsLoading, createTopUpOrder, isCreatingTopUp } = useTopUpOrders();
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);

  // Early return if no order is provided
  if (!order) {
    return null;
  }

  const handleOptionSelect = (option: any) => {
    setSelectedOption(option);
    setIsCheckoutStep(true);
  };

  const handleBackToOptions = () => {
    setIsCheckoutStep(false);
    setSelectedOption(null);
  };

  const handlePurchase = () => {
    if (selectedOption) {
      createTopUpOrder({
        parentOrderId: order.id,
        optionId: selectedOption.id
      });
      onClose();
      // Reset state
      setIsCheckoutStep(false);
      setSelectedOption(null);
    }
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
            {isCheckoutStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToOptions}
                className="mr-2 p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Zap className="h-5 w-5 text-palop-green" />
            {isCheckoutStep ? 'Complete Your Top-Up' : 'Top-Up Your eSIM'}
          </DialogTitle>
          <DialogDescription>
            {isCheckoutStep 
              ? `Confirm your ${selectedOption?.name} purchase for ${order.plan_name}`
              : `Add more data or extend the validity of your ${order.plan_name} plan`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Plan Info */}
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

          {!isCheckoutStep ? (
            /* Option Selection */
            <div className="grid gap-3">
              {topUpOptions.map((option) => (
                <Card key={option.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOptionSelect(option)}>
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
                      <div className="text-right">
                        <div className="text-2xl font-bold">€{option.price}</div>
                        <div className="text-sm text-gray-500">{option.currency}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Checkout Step */
            <div className="space-y-6">
              {/* Selected Option Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Selected Top-Up</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-white ${getTopUpColor(selectedOption.type)}`}>
                      {getTopUpIcon(selectedOption.type)}
                    </div>
                    <div>
                      <div className="font-medium">{selectedOption.name}</div>
                      <div className="text-sm text-gray-600">{selectedOption.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">€{selectedOption.price}</div>
                    <Badge variant="secondary">{getTypeLabel(selectedOption.type)}</Badge>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Top-Up: {selectedOption.name}</span>
                    <span>€{selectedOption.price}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>€{selectedOption.price}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium">Secure Purchase</div>
                  <div>Your top-up will be applied immediately to your existing eSIM plan.</div>
                </div>
              </div>

              {/* Purchase Button */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBackToOptions}
                  className="flex-1"
                  disabled={isCreatingTopUp}
                >
                  Back to Options
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={isCreatingTopUp}
                  className="flex-1 bg-palop-green hover:bg-palop-green/90"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isCreatingTopUp ? 'Processing...' : `Purchase €${selectedOption.price}`}
                </Button>
              </div>
            </div>
          )}

          {!isCheckoutStep && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpCheckoutModal;
