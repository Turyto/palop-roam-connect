
import { Button } from "@/components/ui/button";
import { ESIMPlan } from "@/pages/Purchase";
import { Smartphone } from "lucide-react";

interface ESIMPlansProps {
  onSelectPlan: (plan: ESIMPlan) => void;
}

const ESIMPlans = ({ onSelectPlan }: ESIMPlansProps) => {
  const dataPackages30Days = [
    {
      id: "palop-1gb-30",
      name: "Data Package - 30 Days",
      data: "1 GB",
      days: 30,
      price: 3.36,
      currency: "GBP",
      features: [
        "1 GB of Internet",
        "For consumption in the first 30 days",
        "Coverage in Portugal + 149 More countries",
        "5G where available"
      ]
    },
    {
      id: "palop-3gb-30",
      name: "Data Package - 30 Days",
      data: "3 GB",
      days: 30,
      price: 9.73,
      currency: "GBP",
      features: [
        "3 GB of Internet",
        "For consumption in the first 30 days",
        "Coverage in Portugal + 149 More countries",
        "5G where available"
      ]
    },
    {
      id: "palop-5gb-30",
      name: "Data Package - 30 Days",
      data: "5 GB",
      days: 30,
      price: 14.98,
      currency: "GBP",
      features: [
        "5 GB of Internet",
        "For consumption in the first 30 days", 
        "Coverage in Portugal + 149 More countries",
        "5G where available"
      ]
    },
    {
      id: "palop-10gb-30",
      name: "Data Package - 30 Days",
      data: "10 GB",
      days: 30,
      price: 22.47,
      currency: "GBP",
      features: [
        "10 GB of Internet",
        "For consumption in the first 30 days",
        "Coverage in Portugal + 149 More countries",
        "5G where available"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your eSIM Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dataPackages30Days.map((plan) => (
          <div key={plan.id} className="border rounded-lg overflow-hidden shadow-md">
            {/* Header */}
            <div className="bg-palop-blue p-6 text-white text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{plan.data}</div>
              <div className="text-xl md:text-2xl">{plan.days} DAYS</div>
            </div>
            
            {/* Plan details */}
            <div className="p-6 bg-white">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              
              <div className="text-3xl font-bold mb-4">
                £{plan.price.toFixed(2)}
              </div>
              
              <div className="flex items-center mb-4 bg-white/10 rounded-lg p-2">
                <Smartphone className="h-5 w-5 mr-2 text-palop-blue" />
                <span className="text-sm font-semibold">Data Package</span>
              </div>
              
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-palop-green/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-palop-green"></div>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-palop-green hover:bg-palop-green/90 text-white"
                onClick={() => onSelectPlan(plan)}
              >
                Buy eSIM
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ESIMPlans;
