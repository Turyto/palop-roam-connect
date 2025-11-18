
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Award, Gift } from "lucide-react";

interface LoyaltyCardProps {
  loyaltyStatus: {
    orderCount: number;
    tier: string;
    nextTier: string | null;
    ordersToNext: number;
    eligibleForReferral: boolean;
  };
}

const LoyaltyCard = ({ loyaltyStatus }: LoyaltyCardProps) => {
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'Gold':
        return <Award className="h-5 w-5 text-yellow-600" />;
      case 'Silver':
        return <Star className="h-5 w-5 text-gray-500" />;
      default:
        return <Gift className="h-5 w-5 text-orange-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getProgressValue = () => {
    if (!loyaltyStatus.nextTier) return 100;
    
    const tierTargets = { Bronze: 0, Silver: 3, Gold: 5, Platinum: 10 };
    const currentTarget = tierTargets[loyaltyStatus.tier as keyof typeof tierTargets];
    const nextTarget = tierTargets[loyaltyStatus.nextTier as keyof typeof tierTargets];
    
    return ((loyaltyStatus.orderCount - currentTarget) / (nextTarget - currentTarget)) * 100;
  };

  return (
    <Card className={`border-l-4 ${loyaltyStatus.tier === 'Platinum' ? 'border-l-purple-500' : loyaltyStatus.tier === 'Gold' ? 'border-l-yellow-500' : loyaltyStatus.tier === 'Silver' ? 'border-l-gray-500' : 'border-l-orange-500'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getTierIcon(loyaltyStatus.tier)}
          Loyalty Status
          <Badge variant="secondary" className={getTierColor(loyaltyStatus.tier)}>
            {loyaltyStatus.tier}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Orders Completed</span>
          <span className="font-semibold">{loyaltyStatus.orderCount}</span>
        </div>

        {loyaltyStatus.nextTier && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {loyaltyStatus.nextTier}</span>
                <span className="text-gray-600">
                  {loyaltyStatus.ordersToNext} orders to go
                </span>
              </div>
              <Progress value={getProgressValue()} className="h-2" />
            </div>
          </>
        )}

        {loyaltyStatus.tier === 'Platinum' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-800">
              <Crown className="h-4 w-4" />
              <span className="font-medium">Platinum Member</span>
            </div>
            <div className="text-sm text-purple-700 mt-1">
              You've reached our highest tier! Enjoy exclusive benefits and priority support.
            </div>
          </div>
        )}

        {loyaltyStatus.eligibleForReferral && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <span className="font-medium">🎉 Referral Unlocked!</span>
              <div className="mt-1">
                Share your referral code and earn rewards when friends join.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyCard;
