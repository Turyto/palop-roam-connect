
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface ProcessOrderModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  inventoryAvailable: boolean;
  isProcessing: boolean;
}

const ProcessOrderModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onConfirm, 
  inventoryAvailable,
  isProcessing 
}: ProcessOrderModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Order Confirmation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Customer:</p>
                <p className="font-medium">{order.profiles?.full_name || order.profiles?.email}</p>
                
                <p className="text-sm text-gray-600 mt-4">Plan:</p>
                <p className="font-medium">{order.plan_name}</p>
                
                <p className="text-sm text-gray-600 mt-4">Total:</p>
                <p className="font-medium">{order.price} {order.currency}</p>
              </div>
            </CardContent>
          </Card>

          {!inventoryAvailable ? (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Inventory too low</p>
                <p className="text-xs text-red-600">
                  Please restock before processing this order.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Ready to process</p>
                <p className="text-xs text-green-600">
                  This will generate QR code, create eSIM activation, and deduct inventory.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Are you sure you want to fulfill this order?
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!inventoryAvailable || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Process Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessOrderModal;
