
import type { ESIMActivation } from "@/types/esimActivations";

interface CustomerInfoProps {
  activation: ESIMActivation;
}

const CustomerInfo = ({ activation }: CustomerInfoProps) => {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Name</label>
          <div className="text-sm text-gray-900">
            {activation.profiles?.full_name || 'Not provided'}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <div className="text-sm text-gray-900">{activation.profiles?.email}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
