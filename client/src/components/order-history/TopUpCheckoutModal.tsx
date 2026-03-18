import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTopUpOrders } from "@/hooks/useTopUpOrders";
import { Zap, Clock, Wifi, CreditCard, ArrowLeft, Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language";

interface TopUpCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const TopUpCheckoutModal = ({ isOpen, onClose, order }: TopUpCheckoutModalProps) => {
  const { topUpOptions, optionsLoading, createTopUpOrder, isCreatingTopUp } = useTopUpOrders();
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const { t } = useLanguage();
  const o = t.orders;

  if (!order) return null;

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
      createTopUpOrder({ parentOrderId: order.id, optionId: selectedOption.id });
      onClose();
      setIsCheckoutStep(false);
      setSelectedOption(null);
    }
  };

  const handleClose = () => {
    onClose();
    setIsCheckoutStep(false);
    setSelectedOption(null);
  };

  const getTopUpIcon = (type: string) => {
    switch (type) {
      case 'data': return <Wifi className="h-4 w-4" />;
      case 'validity': return <Clock className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'data': return o.topUpTypeData;
      case 'validity': return o.topUpTypeValidity;
      case 'both': return o.topUpTypeCombo;
      default: return o.topUp;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'data': return 'text-blue-600 bg-blue-50';
      case 'validity': return 'text-green-600 bg-green-50';
      case 'both': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (optionsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-palop-green" />
              {o.topUpTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-10 gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-palop-green" />
            <span className="text-sm">{o.topUpLoading}</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {isCheckoutStep && (
              <button
                onClick={handleBackToOptions}
                className="mr-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={o.topUpBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Zap className="h-4 w-4 text-palop-green" />
            {isCheckoutStep ? o.topUpCompleteTitle : o.topUpTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {isCheckoutStep
              ? `${selectedOption?.name} — ${order.plan_name}`
              : o.topUpSubtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {/* Current plan summary */}
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{o.topUpCurrentPlan}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-gray-500">{order.plan_name}</div>
              <div className="text-gray-700 font-medium text-right">€{order.price}</div>
              <div className="text-gray-400">{order.data_amount}</div>
              <div className="text-gray-400 text-right">{order.duration_days} dias</div>
            </div>
          </div>

          {!isCheckoutStep ? (
            /* Option list */
            <div className="space-y-2">
              {topUpOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full text-left bg-white border border-gray-100 rounded-xl p-4 hover:border-palop-green/40 hover:bg-palop-green/5 transition-all group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(option.type)}`}>
                        {getTopUpIcon(option.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-palop-green transition-colors">
                          {option.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {getTypeLabel(option.type)}
                          {option.data_amount && ` · ${o.topUpDataLabel.replace('{amount}', option.data_amount)}`}
                          {option.validity_days && ` · ${o.topUpDaysLabel.replace('{days}', option.validity_days)}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-gray-900">€{option.price}</div>
                      <div className="text-xs text-gray-400">{option.currency}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Checkout confirmation */
            <div className="space-y-4">
              <div className="bg-white border border-palop-green/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(selectedOption.type)}`}>
                    {getTopUpIcon(selectedOption.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{selectedOption.name}</div>
                    <div className="text-xs text-gray-400">{getTypeLabel(selectedOption.type)}</div>
                  </div>
                  <div className="text-lg font-bold text-palop-green">€{selectedOption.price}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{o.topUpSummary}</p>
                <div className="flex justify-between text-gray-600">
                  <span>{selectedOption.name}</span>
                  <span>€{selectedOption.price}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>{o.topUpTotal}</span>
                  <span>€{selectedOption.price}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-palop-green/5 border border-palop-green/15 rounded-lg">
                <Shield className="h-4 w-4 text-palop-green mt-0.5 shrink-0" />
                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">{o.topUpSecureNotice}. </span>
                  {o.topUpSecureDesc}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={handleBackToOptions}
                  disabled={isCreatingTopUp}
                  className="flex-1"
                >
                  {o.topUpBack}
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={isCreatingTopUp}
                  className="flex-1 bg-palop-green hover:bg-palop-green/90 text-white"
                >
                  {isCreatingTopUp ? (
                    <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />{o.topUpProcessing}</>
                  ) : (
                    <><CreditCard className="h-4 w-4 mr-1.5" />{o.topUpConfirm} — €{selectedOption.price}</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!isCheckoutStep && (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-500">
                {o.topUpCancel}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpCheckoutModal;
