
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Phone, Wifi } from "lucide-react";

const plans = [
  {
    id: 1,
    name: "Basic Roaming",
    type: "Data",
    description: "Essential data for light usage while traveling in PALOP countries",
    price: 19.99,
    duration: "7 days",
    features: ["1GB Data", "All PALOP Countries", "24/7 Customer Support"],
    icon: <Globe className="h-10 w-10 text-palop-green" />,
    popular: false
  },
  {
    id: 2,
    name: "Premium Roaming",
    type: "Data & Voice",
    description: "Our most popular plan for travelers needing reliable connectivity",
    price: 29.99,
    duration: "14 days",
    features: ["5GB Data", "500 Minutes", "All PALOP Countries", "24/7 Priority Support"],
    icon: <Wifi className="h-10 w-10 text-palop-yellow" />,
    popular: true
  },
  {
    id: 3,
    name: "Ultimate Roaming",
    type: "Voice",
    description: "Unlimited calling to stay in touch with friends and family",
    price: 24.99,
    duration: "30 days",
    features: ["Unlimited Calling", "All PALOP Countries", "24/7 Customer Support"],
    icon: <Phone className="h-10 w-10 text-palop-red" />,
    popular: false
  },
];

const PlanCards = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Perfect Plan</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Flexible roaming options designed specifically for the PALOP community, with coverage across Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={`card-hover ${plan.popular ? 'border-2 border-palop-green' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 right-4 bg-palop-green text-white px-3 py-1 text-xs font-bold rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader className="space-y-1">
              <div className="mb-3">{plan.icon}</div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/{plan.duration}</span>
              </div>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-palop-green/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-palop-green"></div>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-palop-green hover:bg-palop-green/90">Select Plan</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PlanCards;
