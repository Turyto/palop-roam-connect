
import { Button } from "@/components/ui/button";
import { ESIMPlan } from "@/pages/Purchase";

interface ESIMPlansProps {
  onSelectPlan: (plan: ESIMPlan) => void;
}

const ESIMPlans = ({ onSelectPlan }: ESIMPlansProps) => {
  const plans: ESIMPlan[] = [
    {
      id: "palop-1tb",
      name: "PALOP Premium",
      data: "1 TB",
      days: 30,
      price: 20.00,
      currency: "EUR",
      features: [
        "1 TB of Internet",
        "For consumption in the first 30 days",
        "5G where available",
        "Coverage in all PALOP countries"
      ]
    },
    {
      id: "palop-500gb",
      name: "PALOP Standard",
      data: "500 GB",
      days: 15,
      price: 15.00,
      currency: "EUR",
      features: [
        "500 GB of Internet",
        "For consumption in the first 15 days",
        "5G where available",
        "Coverage in all PALOP countries"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your eSIM Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
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
                {plan.price.toFixed(2)} <span className="text-sm">{plan.currency}</span>
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
