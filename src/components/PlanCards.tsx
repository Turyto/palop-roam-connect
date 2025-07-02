
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Smartphone, Users, Briefcase, Building, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    id: "lite",
    title: "Lite",
    description: "Perfect for tourists",
    data: "1-2 GB",
    duration: "7 days", 
    price: "6.00",
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
    price: "12.50", 
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
    price: "27.50",
    icon: <Briefcase className="h-8 w-8" />,
    features: ["PALOP+ roaming", "Priority support", "Business-grade"],
    color: "from-palop-yellow/20 to-palop-yellow/10"
  },
  {
    id: "ngo",
    title: "NGO",
    description: "For humanitarian missions",
    data: "10+ GB",
    duration: "60+ days",
    price: "45.00",
    icon: <Building className="h-8 w-8" />,
    features: ["Multi-country coverage", "Extended validity", "Mission support"],
    color: "from-red-500/20 to-red-500/10"
  },
  {
    id: "cplp",
    title: "CPLP Traveler",
    description: "Cultural exchange programs",
    data: "3-5 GB",
    duration: "22 days",
    price: "18.00",
    icon: <Globe className="h-8 w-8" />,
    features: ["CPLP countries", "Cultural connectivity", "Exchange support"],
    color: "from-gray-500/20 to-gray-500/10"
  },
  {
    id: "palop-neighbours1",
    title: "Palop Neighbours1",
    description: "Algeria coverage",
    data: "100 MB",
    duration: "7 days",
    price: "2.30",
    icon: <Globe className="h-8 w-8" />,
    features: ["Real eSIM provisioning", "Algeria coverage", "Instant delivery"],
    color: "from-orange-500/20 to-orange-500/10",
    realEsim: true
  },
  {
    id: "palop-neighbours2",
    title: "Palop Neighbours2", 
    description: "25+ African areas",
    data: "1 GB",
    duration: "7 days",
    price: "7.70",
    icon: <Building className="h-8 w-8" />,
    features: ["Multi-area coverage", "Data reloadable", "eSIM Access powered"],
    color: "from-purple-500/20 to-purple-500/10",
    realEsim: true
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
        
        <div className="max-w-7xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {plans.map((plan) => (
                <CarouselItem key={plan.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className={`h-full card-hover ${plan.popular ? 'border-2 border-palop-green shadow-lg' : ''} relative`}>
                    {plan.popular && (
                      <div className="absolute -top-3 right-4 bg-palop-green text-white px-3 py-1 text-xs font-bold rounded-full z-10">
                        Most Popular
                      </div>
                    )}
                    
                    {plan.realEsim && (
                      <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 text-xs font-bold rounded-full z-10">
                        Real eSIM
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center text-palop-blue`}>
                        {plan.icon}
                      </div>
                      <CardTitle className="text-xl">{plan.title}</CardTitle>
                      <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="text-center flex-grow">
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
                        <Link to={`/purchase?plan=${plan.id}`}>Choose Plan</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Swipe to explore all available plans for the PALOP community
          </p>
          <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10" asChild>
            <Link to="/plans">View All Details</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlanCards;
