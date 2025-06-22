
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ESIMProvisioningErrorStateProps {
  onRetry: () => void;
}

const ESIMProvisioningErrorState = ({ onRetry }: ESIMProvisioningErrorStateProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>eSIM Provisioning Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load eSIM activations</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ESIMProvisioningErrorState;
