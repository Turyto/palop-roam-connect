
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Users, Briefcase, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import CountryFlagChip from "./CountryFlagChip";
import { coverageClusters } from "@/data/coverageClusters";

const plans = [
  {
    id: "palop-core",
    title: "PALOP Core 3GB",
    clusterName: "PALOP Core",
    tagline: "Stay connected in your PALOP home countries.",
    description: "Essential connectivity for PALOP nationals",
    data: "3 GB",
    duration: "30 days", 
    price: "12.50",
    icon: <Smartphone className="h-8 w-8" />,
    features: ["QR-code activation", "SMS welcome pack", "Community support"],
    color: "from-palop-green/20 to-palop-green/10",
    badgeColor: "bg-palop-green",
    countries: coverageClusters.find(c => c.id === 'palop-core')?.countries || []
  },
  {
    id: "palop-regional", 
    title: "PALOP Regional 5GB",
    clusterName: "PALOP Regional",
    tagline: "For travelers across PALOP + African neighbors.",
    description: "Extended coverage across Southern & Central Africa",
    data: "5 GB",
    duration: "30 days",
    price: "18.50", 
    icon: <Users className="h-8 w-8" />,
    features: ["Multi-country roaming", "Priority support", "Travel-optimized"],
    color: "from-palop-blue/20 to-palop-blue/10",
    badgeColor: "bg-palop-blue",
    countries: coverageClusters.find(c => c.id === 'palop-regional')?.countries || [],
    popular: true
  },
  {
    id: "diaspora-europe",
    title: "Diaspora Europe 10GB", 
    description: "Perfect for PALOP nationals in Europe & Americas",
    clusterName: "Diaspora Europe",
    tagline: "Perfect for PALOP nationals living or traveling in Europe.",
    data: "10 GB",
    duration: "30 days",
    price: "27.50",
    icon: <Briefcase className="h-8 w-8" />,
    features: ["Europe + Americas", "Diaspora gifting", "Extended validity"],
    color: "from-palop-yellow/20 to-palop-yellow/10",
    badgeColor: "bg-palop-yellow",
    countries: coverageClusters.find(c => c.id === 'palop-diaspora')?.countries || []
  },
  {
    id: "cplp-global",
    title: "CPLP Essential 5GB",
    clusterName: "CPLP Global",
    tagline: "Connect across all Portuguese-speaking countries.",
    description: "Complete CPLP connectivity",
    data: "5 GB",
    duration: "30 days",
    price: "22.00",
    icon: <Globe className="h-8 w-8" />,
    features: ["All CPLP countries", "Cultural connectivity", "Global access"],
    color: "from-red-500/20 to-red-500/10",
    badgeColor: "bg-red-500",
    countries: coverageClusters.find(c => c.id === 'cplp-global')?.countries || []
  }
];

const CoverageFilter = ({ onFilterSelect }: { onFilterSelect: (clusterId: string) => void }) => {
  const clusters = [
    { id: 'palop-core', name: 'PALOP Core' },
    { id: 'palop-regional', name: 'PALOP Regional' },
    { id: 'diaspora-europe', name: 'Diaspora Europe' },
    { id: 'cplp-global', name: 'CPLP Global' }
  ];

  return (
    <div className="mb-8">
      <p className="text-center text-gray-600 mb-4">Where do you need coverage?</p>
      <div className="flex flex-wrap justify-center gap-3">
        {clusters.map((cluster) => (
          <Button
            key={cluster.id}
            variant="outline"
            className="border-palop-green text-palop-green hover:bg-palop-green/10"
            onClick={() => onFilterSelect(cluster.id)}
          >
            {cluster.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

const PlanCards = () => {
  const handleFilterSelect = (clusterId: string) => {
    const element = document.getElementById(`plan-${clusterId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Perfect Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Coverage-focused packages designed for every member of the PALOP community
          </p>
        </div>
        
        <CoverageFilter onFilterSelect={handleFilterSelect} />
        
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
                  <Card 
                    id={`plan-${plan.id}`}
                    className={`h-full card-hover ${plan.popular ? 'border-2 border-palop-green shadow-lg' : ''} relative`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 right-4 bg-palop-green text-white px-3 py-1 text-xs font-bold rounded-full z-10">
                        Most Popular
                      </div>
                    )}
                    
                    <Badge className={`absolute -top-2 left-4 ${plan.badgeColor} text-white text-xs z-10`}>
                      {plan.clusterName}
                    </Badge>
                    
                    <CardHeader className="text-center pb-2 pt-8">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center text-palop-blue`}>
                        {plan.icon}
                      </div>
                      <CardTitle className="text-xl">{plan.title}</CardTitle>
                      <CardDescription className="text-gray-600 mb-2">{plan.tagline}</CardDescription>
                      
                      {/* Coverage Countries */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Coverage Countries</p>
                        <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto">
                          {plan.countries.slice(0, 8).map((country) => (
                            <CountryFlagChip
                              key={country.code}
                              name={country.name}
                              flag={country.flag}
                              size="sm"
                            />
                          ))}
                          {plan.countries.length > 8 && (
                            <span className="text-xs text-gray-500 self-center">
                              +{plan.countries.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
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
                        <Link to={`/plans?cluster=${plan.id}`}>Choose Plan</Link>
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
            Each plan includes the best local networks in covered countries to keep you connected wherever you are.
          </p>
          <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10" asChild>
            <Link to="/plans">Compare All Plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlanCards;
