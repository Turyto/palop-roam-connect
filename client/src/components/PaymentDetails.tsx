
import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";

const PaymentDetails = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="font-semibold text-lg">Payment Details</h2>
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-md">
          <CreditCard className="text-gray-600" />
          <span className="font-medium">Credit Card Payment</span>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <Input placeholder="1234 5678 9012 3456" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <Input placeholder="John Smith" className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <Input placeholder="MM/YY" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <Input placeholder="123" className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
