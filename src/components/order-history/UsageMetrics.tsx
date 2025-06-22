
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wifi, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface UsageMetricsProps {
  order: any;
}

const UsageMetrics = ({ order }: UsageMetricsProps) => {
  // Mock data - in real implementation, this would come from carrier APIs
  const getMockUsageData = (order: any) => {
    // Simulate usage based on order age and data amount
    const orderAge = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const dataAmountGB = parseFloat(order.data_amount.replace('GB', ''));
    
    // Simulate realistic usage patterns
    const dataUsedPercent = Math.min(95, Math.max(5, (orderAge / order.duration_days) * 100 + Math.random() * 20));
    const daysRemaining = Math.max(0, order.duration_days - orderAge);
    const daysUsedPercent = Math.min(100, (orderAge / order.duration_days) * 100);
    
    const dataUsedGB = (dataAmountGB * dataUsedPercent / 100).toFixed(2);
    const dataRemainingGB = (dataAmountGB - parseFloat(dataUsedGB)).toFixed(2);
    
    return {
      dataUsedPercent: Math.round(dataUsedPercent),
      dataUsedGB,
      dataRemainingGB,
      daysRemaining,
      daysUsedPercent: Math.round(daysUsedPercent),
      totalDataGB: dataAmountGB,
      isLowData: dataUsedPercent > 80,
      isExpiringSoon: daysRemaining <= 3 && daysRemaining > 0
    };
  };

  // Only show usage for completed orders
  if (order.status !== 'completed' || order.payment_status !== 'succeeded') {
    return null;
  }

  const usage = getMockUsageData(order);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Usage Statistics
          {usage.isLowData && (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low Data
            </Badge>
          )}
          {usage.isExpiringSoon && (
            <Badge variant="outline" className="ml-2 border-orange-500 text-orange-700">
              <Clock className="h-3 w-3 mr-1" />
              Expires Soon
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Data Usage</span>
            </div>
            <span className="text-gray-600">
              {usage.dataUsedGB}GB / {usage.totalDataGB}GB
            </span>
          </div>
          <Progress 
            value={usage.dataUsedPercent} 
            className="h-2"
            style={{
              '--progress-background': usage.isLowData ? 'rgb(239 68 68)' : 'rgb(59 130 246)'
            } as React.CSSProperties}
          />
          <div className="text-xs text-gray-500">
            {usage.dataRemainingGB}GB remaining ({100 - usage.dataUsedPercent}%)
          </div>
        </div>

        {/* Validity Period */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium">Validity Period</span>
            </div>
            <span className="text-gray-600">
              {usage.daysRemaining} days remaining
            </span>
          </div>
          <Progress 
            value={usage.daysUsedPercent} 
            className="h-2"
            style={{
              '--progress-background': usage.isExpiringSoon ? 'rgb(249 115 22)' : 'rgb(34 197 94)'
            } as React.CSSProperties}
          />
          <div className="text-xs text-gray-500">
            {usage.daysRemaining} of {order.duration_days} days remaining
          </div>
        </div>

        {/* Usage Tips */}
        {(usage.isLowData || usage.isExpiringSoon) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">Consider a Top-Up</div>
                <div className="text-yellow-700">
                  {usage.isLowData && "You're running low on data. "}
                  {usage.isExpiringSoon && "Your plan expires soon. "}
                  Top-up now to avoid service interruption.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageMetrics;
