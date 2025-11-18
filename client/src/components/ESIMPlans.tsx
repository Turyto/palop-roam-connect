
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ESIMPlan } from "@/pages/Purchase";
import { Smartphone, Users, Briefcase, Globe } from "lucide-react";
import CountryFlagChip from "./CountryFlagChip";
import { coverageClusters } from "@/data/coverageClusters";

interface ESIMPlansProps {
  onSelectPlan: (plan: ESIMPlan) => void;
}

const ESIMPlans = ({ onSelectPlan }: ESIMPlansProps) => {
  const pallopPlans: (ESIMPlan & { 
    clusterName: string; 
    tagline: string; 
    countries: Array<{name: string; flag: string; code: string}>;
    badgeColor: string;
  })[] = [
    {
      id: "palop-core",
      name: "PALOP Core 3GB",
      clusterName: "PALOP Core",
      tagline: "Stay connected in your PALOP home countries.",
      data: "3 GB",
      days: 30,
      price: 12.50,
      currency: "EUR",
      features: [
        "3 GB of Internet",
        "Valid for 30 days",
        "SMS welcome pack",
        "QR-code activation",
        "Community support"
      ],
      countries: coverageClusters.find(c => c.id === 'palop-core')?.countries || [],
      badgeColor: "bg-palop-green"
    },
    {
      id: "palop-regional",
      name: "PALOP Regional 5GB",
      clusterName: "PALOP Regional", 
      tagline: "For travelers across PALOP + African neighbors.",
      data: "5 GB", 
      days: 30,
      price: 18.50,
      currency: "EUR",
      features: [
        "5 GB of Internet",
        "Valid for 30 days",
        "Multi-country roaming",
        "Priority support",
        "Travel-optimized network"
      ],
      countries: coverageClusters.find(c => c.id === 'palop-regional')?.countries || [],
      badgeColor: "bg-palop-blue"
    },
    {
      id: "diaspora-europe",
      name: "Diaspora Europe 10GB",
      clusterName: "Diaspora Europe",
      tagline: "Perfect for PALOP nationals living or traveling in Europe.",
      data: "10 GB",
      days: 30,
      price: 27.50,
      currency: "EUR",
      features: [
        "10 GB of Internet",
        "Valid for 30 days",
        "Europe + Americas coverage",
        "Diaspora gifting enabled",
        "Extended validity options"
      ],
      countries: coverageClusters.find(c => c.id === 'palop-diaspora')?.countries || [],
      badgeColor: "bg-palop-yellow"
    },
    {
      id: "cplp-global",
      name: "CPLP Essential 5GB",
      clusterName: "CPLP Global",
      tagline: "Connect across all Portuguese-speaking countries.",
      data: "5 GB",
      days: 30,  
      price: 22.00,
      currency: "EUR",
      features: [
        "5 GB of Internet",
        "Valid for 30 days",
        "All CPLP countries",
        "Cultural connectivity",
        "Global Portuguese network"
      ],
      countries: coverageClusters.find(c => c.id === 'cplp-global')?.countries || [],
      badgeColor: "bg-red-500"
    }
  ];

  const getIcon = (planId: string) => {
    switch (planId) {
      case "palop-core":
        return <Smartphone className="h-12 w-12" />;
      case "palop-regional":
        return <Users className="h-12 w-12" />;
      case "diaspora-europe":
        return <Briefcase className="h-12 w-12" />;
      case "cplp-global":
        return <Globe className="h-12 w-12" />;
      default:
        return <Smartphone className="h-12 w-12" />;
    }
  };

  const getColorClass = (planId: string) => {
    switch (planId) {
      case "palop-core":
        return "bg-palop-green";
      case "palop-regional":
        return "bg-palop-blue";
      case "diaspora-europe":
        return "bg-palop-yellow";
      case "cplp-global":
        return "bg-red-500";
      default:
        return "bg-palop-green";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Coverage Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pallopPlans.map((plan) => (
          <div key={plan.id} className={`border rounded-lg overflow-hidden shadow-md ${plan.id === 'palop-regional' ? 'border-2 border-palop-blue' : ''} relative`}>
            {plan.id === 'palop-regional' && (
              <div className="absolute -top-3 right-4 bg-palop-blue text-white px-3 py-1 text-xs font-bold rounded-full">
                Most Popular
              </div>
            )}
            
            <Badge className={`absolute -top-2 left-4 ${plan.badgeColor} text-white text-xs z-10`}>
              {plan.clusterName}
            </Badge>
            
            {/* Header */}
            <div className={`${getColorClass(plan.id)} p-6 text-white text-center pt-8`}>
              <div className="flex items-center justify-center mb-3">
                {getIcon(plan.id)}
              </div>
              <div className="text-2xl font-bold mb-2">{plan.name}</div>
              <div className="text-sm opacity-90 mb-3">{plan.tagline}</div>
              <div className="text-lg">{plan.data} • {plan.days} days</div>
            </div>
            
            {/* Plan details */}
            <div className="p-6 bg-white">
              {/* Coverage Countries */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Coverage Countries</p>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {plan.countries.slice(0, 12).map((country) => (
                    <CountryFlagChip
                      key={country.code}
                      name={country.name}
                      flag={country.flag}
                      size="sm"
                    />
                  ))}
                  {plan.countries.length > 12 && (
                    <span className="text-xs text-gray-500 self-center bg-gray-100 px-2 py-1 rounded-full">
                      +{plan.countries.length - 12} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-palop-green">
                  €{plan.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {plan.data} for {plan.days} days
                </div>
              </div>
              
              <ul className="mb-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 h-4 w-4 rounded-full bg-palop-green/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-palop-green"></div>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-palop-green hover:bg-palop-green/90 text-white"
                onClick={() => onSelectPlan(plan)}
              >
                Select {plan.clusterName}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <div className="bg-gray-50 rounded-lg p-4 max-w-3xl mx-auto">
          <h3 className="font-semibold mb-2">Coverage Information</h3>
          <p className="text-gray-600 text-sm">
            Each plan includes the best local networks in covered countries to keep you connected wherever you are. 
            Coverage clusters are designed specifically for PALOP community travel patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ESIMPlans;
