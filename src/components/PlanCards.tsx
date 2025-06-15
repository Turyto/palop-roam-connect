
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Users, Briefcase, Building, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    id: "lite",
    title: "Lite",
    description: "Perfect for tourists",
    data: "1-2 GB",
    duration: "7 days", 
    price: "5-7",
    icon: <Smartphone className="h-8 w-8" />,
    features: ["QR-code activation", "Airport availability", "Tourist-friendly"],
    color: "from-palop-blue/20 to-palop-blue/10"
  },
  {
    id: "core", 
    title: "Core",
    description: "Ideal for diaspora returnees",
    data: "3-5 GB",
    duration: "30 days",
    price: "10-15", 
    icon: <Users className="h-8 w-8" />,
    features: ["Diaspora gifting enabled", "SMS welcome pack", "Community support"],
    color: "from-palop-green/20 to-palop-green/10",
    popular: true
  },
  {
    id: "plus",
    title: "Plus", 
    description: "Built for business travelers",
    data: "10 GB",
    duration: "30 days",
    price: "25-30",
    icon: <Briefcase className="h-8 w-8" />,
    features: ["PALOP+ roaming", "Priority support", "Business-grade"],
    color: "from-palop-yellow/20 to-palop-yellow/10"
  }
];

const PlanCards = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Perfect Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Flexible packages designed for every member of the PALOP community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative card-hover ${plan.popular ? 'border-2 border-palop-green shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 right-4 bg-palop-green text-white px-3 py-1 text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center text-palop-blue`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.title}</CardTitle>
                <CardDescription className="text-gray-600">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-palop-green">€{plan.price}</div>
                  <div className="text-sm text-gray-500">{plan.data} • {plan.duration}</div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-palop-green rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Button className="w-full bg-palop-green hover:bg-palop-green/90" asChild>
                  <Link to="/plans">Choose Plan</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Need more options? Check out our NGO Pack and Local CPLP plans
          </p>
          <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10" asChild>
            <Link to="/plans">View All Plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlanCards;
