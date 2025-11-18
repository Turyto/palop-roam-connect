
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import type { ESIMActivation } from "@/types/esimActivations";

interface StatusInfoProps {
  activation: ESIMActivation;
}

const StatusInfo = ({ activation }: StatusInfoProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">Status Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Activation Status</label>
          <Badge variant="outline" className={`w-fit ${getStatusColor(activation.status)}`}>
            {activation.status}
          </Badge>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Provisioning Status</label>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 w-fit ${getStatusColor(activation.provisioning_status)}`}
          >
            {getStatusIcon(activation.provisioning_status)}
            {activation.provisioning_status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default StatusInfo;
