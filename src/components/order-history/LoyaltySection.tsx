
import { useReferralSystem } from "@/hooks/useReferralSystem";
import LoyaltyCard from "../loyalty/LoyaltyCard";
import ReferralCard from "../loyalty/ReferralCard";
import DeviceCompatibilityChecker from "../loyalty/DeviceCompatibilityChecker";

const LoyaltySection = () => {
  const {
    referralCode,
    referralRewards,
    loyaltyStatus,
    codeLoading,
    rewardsLoading,
    loyaltyLoading,
    generateReferralCode,
    isGenerating,
  } = useReferralSystem();

  if (loyaltyLoading) {
    return (
      <div className="space-y-6">
        <div className="text-lg">Loading loyalty information...</div>
      </div>
    );
  }

  if (!loyaltyStatus) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Loyalty Status */}
      <LoyaltyCard loyaltyStatus={loyaltyStatus} />

      {/* Referral Program */}
      <ReferralCard
        referralCode={referralCode}
        referralRewards={referralRewards}
        loyaltyStatus={loyaltyStatus}
        onGenerateCode={generateReferralCode}
        isGenerating={isGenerating}
      />

      {/* Device Compatibility */}
      <DeviceCompatibilityChecker />
    </div>
  );
};

export default LoyaltySection;
