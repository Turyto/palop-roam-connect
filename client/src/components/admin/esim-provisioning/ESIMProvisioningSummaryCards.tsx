
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import type { ESIMActivation } from "@/types/esimActivations";

interface ESIMProvisioningSummaryCardsProps {
  activations: ESIMActivation[];
}

const ESIMProvisioningSummaryCards = ({ activations }: ESIMProvisioningSummaryCardsProps) => {
  const pendingCount = activations.filter(a => a.provisioning_status === 'pending').length;
  const inProgressCount = activations.filter(a => a.provisioning_status === 'in_progress').length;
  const completedCount = activations.filter(a => a.provisioning_status === 'completed').length;
  const failedCount = activations.filter(a => a.provisioning_status === 'failed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <RefreshCw className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold">{inProgressCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold">{failedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESIMProvisioningSummaryCards;
