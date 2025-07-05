
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mb-12">
      <p className="text-center text-gray-600 mb-6 text-lg">Where do you need coverage?</p>
      <div className="flex flex-wrap justify-center gap-3">
        {clusters.map((cluster) => (
          <Button
            key={cluster.id}
            variant="outline"
            className="border-palop-green text-palop-green hover:bg-palop-green hover:text-white transition-all duration-200"
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
        
        {/* Responsive Grid Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                id={`plan-${plan.id}`}
                className={`h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-palop-green/30 ${
                  plan.popular ? 'border-2 border-palop-green shadow-lg scale-105 lg:scale-100' : 'border border-gray-200'
                } relative flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-4 bg-palop-green text-white px-3 py-1 text-xs font-bold rounded-full z-10">
                    Most Popular
                  </div>
                )}
                
                <Badge className={`absolute -top-2 left-4 ${plan.badgeColor} text-white text-xs z-10 font-semibold`}>
                  {plan.clusterName}
                </Badge>
                
                <CardHeader className="text-center pb-4 pt-8 flex-shrink-0">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center text-palop-blue`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl font-bold leading-tight">{plan.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed line-clamp-2">
                    {plan.tagline}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow px-6">
                  {/* Coverage Countries - Fixed Height Container */}
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-3 font-medium">Coverage Countries</p>
                    <div className="h-20 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {plan.countries.slice(0, 12).map((country) => (
                          <CountryFlagChip
                            key={country.code}
                            name={country.name}
                            flag={country.flag}
                            size="sm"
                          />
                        ))}
                        {plan.countries.length > 12 && (
                          <span className="text-xs text-gray-500 self-center bg-gray-100 px-2 py-1 rounded-full font-medium">
                            +{plan.countries.length - 12} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing */}
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-palop-green">€{plan.price}</div>
                    <div className="text-sm text-gray-500 mt-1 font-medium">{plan.data} • {plan.duration}</div>
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-palop-green rounded-full mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-4 pb-6 px-6 mt-auto">
                  <Button 
                    className="w-full bg-palop-green hover:bg-palop-green/90 transition-colors duration-200 font-semibold" 
                    asChild
                  >
                    <Link to={`/plans?cluster=${plan.id}`}>Choose Plan</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6 text-base max-w-3xl mx-auto">
            Each plan includes the best local networks in covered countries to keep you connected wherever you are.
          </p>
          <Button 
            variant="outline" 
            className="border-palop-green text-palop-green hover:bg-palop-green hover:text-white transition-all duration-200 font-semibold" 
            asChild
          >
            <Link to="/plans">Compare All Plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlanCards;
