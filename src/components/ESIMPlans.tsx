
import { Button } from "@/components/ui/button";
import { ESIMPlan } from "@/pages/Purchase";
import { Smartphone, Users, Briefcase, Building, Globe } from "lucide-react";

interface ESIMPlansProps {
  onSelectPlan: (plan: ESIMPlan) => void;
}

const ESIMPlans = ({ onSelectPlan }: ESIMPlansProps) => {
  const pallopPlans: ESIMPlan[] = [
    {
      id: "lite",
      name: "Lite",
      data: "1-2 GB",
      days: 7,
      price: 6,
      currency: "EUR",
      features: [
        "1-2 GB of Internet",
        "Valid for 7 days",
        "QR-code activation",
        "Airport availability",
        "Tourist-friendly setup"
      ]
    },
    {
      id: "core",
      name: "Core",
      data: "3-5 GB", 
      days: 30,
      price: 12.50,
      currency: "EUR",
      features: [
        "3-5 GB of Internet",
        "Valid for 30 days",
        "Diaspora gifting enabled",
        "SMS welcome pack",
        "Community support"
      ]
    },
    {
      id: "plus",
      name: "Plus",
      data: "10 GB",
      days: 30,
      price: 27.50,
      currency: "EUR",
      features: [
        "10 GB of Internet",
        "Valid for 30 days",
        "PALOP+ roaming",
        "Priority support",
        "Business-grade reliability"
      ]
    },
    {
      id: "palop-neighbours1",
      name: "Palop Neighbours1",
      data: "100 MB",
      days: 7,  
      price: 2.30,
      currency: "EUR",
      features: [
        "100 MB of Internet",
        "Valid for 7 days",
        "Algeria coverage",
        "Real eSIM provisioning",
        "Instant QR delivery"
      ]
    },
    {
      id: "palop-neighbours2", 
      name: "Palop Neighbours2",
      data: "1 GB",
      days: 7,
      price: 7.70,
      currency: "EUR",
      features: [
        "1 GB of Internet", 
        "Valid for 7 days",
        "25+ African areas",
        "Multi-area coverage",
        "Data reloadable"
      ]
    }
  ];

  const getIcon = (planId: string) => {
    switch (planId) {
      case "lite":
        return <Smartphone className="h-12 w-12" />;
      case "core":
        return <Users className="h-12 w-12" />;
      case "plus":
        return <Briefcase className="h-12 w-12" />;
      case "palop-neighbours1":
        return <Globe className="h-12 w-12" />;
      case "palop-neighbours2":
        return <Building className="h-12 w-12" />;
      default:
        return <Smartphone className="h-12 w-12" />;
    }
  };

  const getColorClass = (planId: string) => {
    switch (planId) {
      case "lite":
        return "bg-palop-blue";
      case "core":
        return "bg-palop-green";
      case "plus":
        return "bg-palop-yellow";
      case "palop-neighbours1":
        return "bg-orange-500";
      case "palop-neighbours2":
        return "bg-purple-500";
      default:
        return "bg-palop-blue";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your eSIM Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pallopPlans.map((plan) => (
          <div key={plan.id} className={`border rounded-lg overflow-hidden shadow-md ${plan.id === 'core' ? 'border-2 border-palop-green' : ''} relative`}>
            {plan.id === 'core' && (
              <div className="absolute -top-3 right-4 bg-palop-green text-white px-3 py-1 text-xs font-bold rounded-full">
                Most Popular
              </div>
            )}
            
            {(plan.id === 'palop-neighbours1' || plan.id === 'palop-neighbours2') && (
              <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 text-xs font-bold rounded-full">
                Real eSIM
              </div>
            )}
            
            {/* Header */}
            <div className={`${getColorClass(plan.id)} p-6 text-white text-center`}>
              <div className="flex items-center justify-center mb-3">
                {getIcon(plan.id)}
              </div>
              <div className="text-2xl font-bold mb-2">{plan.name}</div>
              <div className="text-lg">{plan.data}</div>
              <div className="text-sm opacity-90">{plan.days} days</div>
            </div>
            
            {/* Plan details */}
            <div className="p-6 bg-white">
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
                Select {plan.name}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <div className="bg-gray-50 rounded-lg p-4 max-w-3xl mx-auto">
          <h3 className="font-semibold mb-2">Coverage Information</h3>
          <p className="text-gray-600 text-sm">
            All plans include coverage across PALOP countries and neighboring regions. 
            Real eSIM plans provide actual connectivity through our eSIM Access partnership.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ESIMPlans;
