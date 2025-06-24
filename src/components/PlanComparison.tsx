import { Check, X, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

const PlanComparison = () => {
  const features = [
    { 
      name: "Data Allowance", 
      lite: "1-2 GB", 
      core: "3-5 GB", 
      plus: "10 GB", 
      ngo: "10+ GB", 
      cplp: "3-5 GB",
      tooltip: null
    },
    { 
      name: "Validity Period", 
      lite: "7 days", 
      core: "30 days", 
      plus: "30 days", 
      ngo: "30-90 days", 
      cplp: "15-30 days",
      tooltip: null
    },
    { 
      name: "QR Activation", 
      lite: true, 
      core: true, 
      plus: true, 
      ngo: true, 
      cplp: true,
      tooltip: "Instant activation using QR code scan"
    },
    { 
      name: "Airport Availability", 
      lite: true, 
      core: false, 
      plus: true, 
      ngo: false, 
      cplp: false,
      tooltip: "Purchase and activate before boarding your flight"
    },
    { 
      name: "Diaspora Gifting", 
      lite: false, 
      core: true, 
      plus: true, 
      ngo: false, 
      cplp: false,
      tooltip: "Send this plan to a family member or friend"
    },
    { 
      name: "PALOP+ Roaming", 
      lite: false, 
      core: false, 
      plus: true, 
      ngo: true, 
      cplp: false,
      tooltip: "Travel across Angola, Cape Verde, Mozambique with 1 eSIM"
    },
    { 
      name: "CPLP Coverage", 
      lite: false, 
      core: false, 
      plus: false, 
      ngo: true, 
      cplp: true,
      tooltip: "Coverage across all Portuguese-speaking countries"
    },
    { 
      name: "Priority Support", 
      lite: false, 
      core: false, 
      plus: true, 
      ngo: true, 
      cplp: false,
      tooltip: "24/7 priority customer support"
    },
    { 
      name: "Multi-SIM Support", 
      lite: false, 
      core: false, 
      plus: false, 
      ngo: true, 
      cplp: false,
      tooltip: "Manage multiple eSIMs from one account"
    },
    { 
      name: "Usage Controls", 
      lite: false, 
      core: false, 
      plus: false, 
      ngo: true, 
      cplp: false,
      tooltip: "Advanced data usage monitoring and controls"
    },
  ];

  const plans = [
    { 
      id: "lite", 
      name: "🧳 Lite", 
      price: "€6.00", 
      color: "bg-palop-blue", 
      popular: false,
      microcopy: "Best for weekend or short travel",
      ctaLabel: "Get Started with Lite",
      promo: false
    },
    { 
      id: "core", 
      name: "✈️ Core", 
      price: "€12.50", 
      color: "bg-palop-green", 
      popular: true,
      microcopy: "Ideal for 30-day roaming across PALOP",
      ctaLabel: "Select Core Plan",
      promo: true
    },
    { 
      id: "plus", 
      name: "🌍 Plus", 
      price: "€27.50", 
      color: "bg-palop-yellow", 
      popular: false,
      microcopy: "For digital nomads and regular travelers",
      ctaLabel: "Choose Plus",
      promo: false
    },
    { 
      id: "ngo", 
      name: "🎁 NGO Pack", 
      price: "€20-50", 
      color: "bg-palop-red", 
      popular: false,
      microcopy: "Multi-device use for NGO teams",
      ctaLabel: "Join with NGO Pack",
      promo: false
    },
    { 
      id: "cplp", 
      name: "🇨🇵 CPLP", 
      price: "€5-10", 
      color: "bg-gray-600", 
      popular: false,
      microcopy: "Stay connected within CPLP countries",
      ctaLabel: "Choose CPLP",
      promo: false
    },
  ];

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-4 w-4 text-palop-green mx-auto" />
      ) : (
        <X className="h-4 w-4 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  const renderFeatureName = (feature: any) => {
    if (feature.tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <span>{feature.name}</span>
                <Info className="h-3 w-3 text-gray-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{feature.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return feature.name;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare All Plans</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect plan for your needs with our detailed comparison
          </p>
        </div>

        {/* Mobile Card Layout */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden mb-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative hover:shadow-lg transition-shadow duration-150 ${plan.popular ? 'border-2 border-palop-green' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium uppercase">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className={`${plan.color} text-white text-center py-6`}>
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="text-3xl font-bold mb-3">{plan.price}</div>
                <p className="text-sm opacity-90 leading-relaxed px-2">{plan.microcopy}</p>
                {plan.promo && (
                  <Badge className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mt-3 mx-auto w-fit">
                    Limited Time
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  {features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">{feature.name}</span>
                      <div>{renderFeatureValue(feature[plan.id as keyof typeof feature] as string | boolean)}</div>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full bg-palop-green hover:bg-palop-green/90 text-white font-medium py-3" asChild>
                  <Link to={`/purchase?plan=${plan.id}`}>{plan.ctaLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Plan headers */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <div className="font-semibold text-gray-700">Features</div>
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative hover:bg-gray-50 transition-colors duration-150 ${plan.popular ? 'border-2 border-palop-green' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium uppercase">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={`${plan.color} text-white text-center py-4`}>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-xl font-bold">{plan.price}</div>
                    <p className="text-xs opacity-90 mt-1">{plan.microcopy}</p>
                    {plan.promo && (
                      <Badge className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs mt-2">
                        Limited Time
                      </Badge>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Feature comparison */}
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <div className="font-medium text-gray-700">
                    {renderFeatureName(feature)}
                  </div>
                  <div className="text-center">{renderFeatureValue(feature.lite)}</div>
                  <div className="text-center">{renderFeatureValue(feature.core)}</div>
                  <div className="text-center">{renderFeatureValue(feature.plus)}</div>
                  <div className="text-center">{renderFeatureValue(feature.ngo)}</div>
                  <div className="text-center">{renderFeatureValue(feature.cplp)}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-6 gap-4 mt-6">
              <div></div>
              {plans.map((plan) => (
                <div key={plan.id} className="text-center">
                  <Button className="w-full bg-palop-green hover:bg-palop-green/90" asChild>
                    <Link to={`/purchase?plan=${plan.id}`}>{plan.ctaLabel}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanComparison;
