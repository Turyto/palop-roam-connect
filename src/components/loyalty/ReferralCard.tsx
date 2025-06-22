
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Users, Gift, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralCardProps {
  referralCode: any;
  referralRewards: any[];
  loyaltyStatus: any;
  onGenerateCode: () => void;
  isGenerating: boolean;
}

const ReferralCard = ({ 
  referralCode, 
  referralRewards, 
  loyaltyStatus, 
  onGenerateCode, 
  isGenerating 
}: ReferralCardProps) => {
  const { toast } = useToast();

  const copyReferralCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast({
        title: "Code Copied!",
        description: "Your referral code has been copied to clipboard.",
      });
    }
  };

  const shareReferral = () => {
    if (referralCode?.code && navigator.share) {
      navigator.share({
        title: 'Join Cape Verde eSIM',
        text: `Use my referral code ${referralCode.code} and get 10% off your first eSIM!`,
        url: `${window.location.origin}?ref=${referralCode.code}`
      });
    } else {
      copyReferralCode();
    }
  };

  const totalRewards = referralRewards.filter(r => r.status === 'claimed').length;
  const pendingRewards = referralRewards.filter(r => r.status === 'pending').length;

  if (!loyaltyStatus?.eligibleForReferral) {
    return (
      <Card className="border-l-4 border-l-gray-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            Referral Program
            <Badge variant="outline">Locked</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <div className="text-gray-600 mb-2">
              Complete {2 - loyaltyStatus?.orderCount} more orders to unlock referrals
            </div>
            <div className="text-sm text-gray-500">
              Share your code and earn rewards when friends join!
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Referral Program
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!referralCode ? (
          <div className="text-center py-4">
            <Plus className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <div className="text-gray-700 mb-3">
              Generate your unique referral code to start earning rewards!
            </div>
            <Button 
              onClick={onGenerateCode}
              disabled={isGenerating}
              className="bg-green-500 hover:bg-green-600"
            >
              {isGenerating ? 'Generating...' : 'Create Referral Code'}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Your Referral Code</label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    value={referralCode.code} 
                    readOnly 
                    className="font-mono bg-gray-50"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyReferralCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shareReferral}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-800">
                  <div className="font-medium">How it works:</div>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Your friends get 10% off their first order</li>
                    <li>• You earn €2 credit per successful referral</li>
                    <li>• Credits apply automatically to your next purchase</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{referralCode.uses_count}</div>
                <div className="text-xs text-blue-700">Total Uses</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{totalRewards}</div>
                <div className="text-xs text-green-700">Rewards Earned</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-600">{pendingRewards}</div>
                <div className="text-xs text-orange-700">Pending</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralCard;
