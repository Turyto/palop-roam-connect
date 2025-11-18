
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import type { InventoryItem } from "@/hooks/useInventory";

interface RestockModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRestock: (inventoryId: string, amount: number) => void;
  isRestocking: boolean;
}

const RestockModal = ({ item, isOpen, onClose, onRestock, isRestocking }: RestockModalProps) => {
  const [amount, setAmount] = useState<number>(100);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      onRestock(item.id, amount);
      onClose();
      setAmount(100); // Reset for next time
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Restock Inventory
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Country & Carrier</Label>
              <div className="text-lg font-semibold text-gray-900">
                {item.country} / {item.carrier}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Current Stock</Label>
              <div className="text-2xl font-bold text-gray-900">{item.available}</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="10000"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter number of eSIMs to add"
                required
              />
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>New Total:</strong> {item.available + amount} eSIMs
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isRestocking}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isRestocking || amount <= 0}
            >
              {isRestocking ? "Adding..." : `Add ${amount} eSIMs`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestockModal;
