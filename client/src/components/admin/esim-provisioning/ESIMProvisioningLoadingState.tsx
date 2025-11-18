
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

const ESIMProvisioningLoadingState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>eSIM Provisioning Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading activations...</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ESIMProvisioningLoadingState;
