
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import CountryFlagChip from "./CountryFlagChip";
import { coverageClusters } from "@/data/coverageClusters";

const PlanComparison = () => {
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  const plans = [
    {
      id: "palop-core",
      name: "PALOP Core 3GB",
      clusterName: "PALOP Core",
      data: "3 GB",
      duration: "30 days",
      price: "€12.50",
      color: "bg-palop-green",
      badgeColor: "bg-palop-green",
      countries: coverageClusters.find(c => c.id === 'palop-core')?.countries || [],
      features: {
        dataAllowance: "3 GB",
        validityPeriod: "30 days",
        qrActivation: true,
        diasporaGifting: true,
        palopRoaming: false,
        prioritySupport: false,
        cplpCoverage: false
      }
    },
    {
      id: "palop-regional",
      name: "PALOP Regional 5GB",
      clusterName: "PALOP Regional",
      data: "5 GB",
      duration: "30 days",
      price: "€18.50",
      color: "bg-palop-blue",
      badgeColor: "bg-palop-blue",
      countries: coverageClusters.find(c => c.id === 'palop-regional')?.countries || [],
      popular: true,
      features: {
        dataAllowance: "5 GB",
        validityPeriod: "30 days",
        qrActivation: true,
        diasporaGifting: true,
        palopRoaming: true,
        prioritySupport: true,
        cplpCoverage: false
      }
    },
    {
      id: "diaspora-europe",
      name: "Diaspora Europe 10GB",
      clusterName: "Diaspora Europe",
      data: "10 GB",
      duration: "30 days",
      price: "€27.50",
      color: "bg-palop-yellow",
      badgeColor: "bg-palop-yellow",
      countries: coverageClusters.find(c => c.id === 'palop-diaspora')?.countries || [],
      features: {
        dataAllowance: "10 GB",
        validityPeriod: "30 days",
        qrActivation: true,
        diasporaGifting: true,
        palopRoaming: true,
        prioritySupport: true,
        cplpCoverage: false
      }
    },
    {
      id: "cplp-global",
      name: "CPLP Essential 5GB",
      clusterName: "CPLP Global",
      data: "5 GB",
      duration: "30 days",
      price: "€22.00",
      color: "bg-red-500",
      badgeColor: "bg-red-500",
      countries: coverageClusters.find(c => c.id === 'cplp-global')?.countries || [],
      features: {
        dataAllowance: "5 GB",
        validityPeriod: "30 days",
        qrActivation: true,
        diasporaGifting: false,
        palopRoaming: false,
        prioritySupport: false,
        cplpCoverage: true
      }
    }
  ];

  const featureLabels = {
    dataAllowance: "Data Allowance",
    validityPeriod: "Validity Period",
    diasporaGifting: "Diaspora Gifting",
    palopRoaming: "PALOP+ Roaming",
    qrActivation: "QR Activation",
    prioritySupport: "Priority Support",
    cplpCoverage: "CPLP Coverage"
  };

  const totalCountries = Math.max(...plans.map(plan => plan.countries.length));
  const mostPopularPlan = plans.find(plan => plan.popular);

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-4 w-4 text-palop-green mx-auto" />
      ) : (
        <X className="h-4 w-4 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm font-medium text-center">{value}</span>;
  };

  const toggleMobileExpansion = (planId: string) => {
    setExpandedMobile(expandedMobile === planId ? null : planId);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare All Plans</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Find the perfect plan for your needs with our detailed comparison
          </p>
          
          {/* Metrics Bar */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 bg-gray-50 rounded-lg py-4 px-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏳️</span>
              <span>Up to <strong>{totalCountries}</strong> countries covered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span>Most Popular: <strong>{mostPopularPlan?.clusterName}</strong></span>
            </div>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative transition-all duration-300 hover:shadow-lg ${plan.popular ? 'border-2 border-palop-blue' : 'border border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 right-4 bg-palop-blue text-white px-3 py-1 text-xs font-bold rounded-full z-10">
                  Most Popular
                </div>
              )}
              
              <Badge className={`absolute -top-2 left-4 ${plan.badgeColor} text-white text-xs z-10 font-semibold`}>
                {plan.clusterName}
              </Badge>
              
              <CardHeader className={`${plan.color} text-white text-center py-6 pt-8`}>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="text-sm opacity-90 mb-2">{plan.data} • {plan.duration}</div>
                <div className="text-3xl font-bold mb-4">{plan.price}</div>
                
                {/* Coverage Countries */}
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs opacity-80 mb-2">Coverage Countries</p>
                  <div className="flex flex-wrap gap-1 justify-center max-h-16 overflow-y-auto">
                    {plan.countries.slice(0, 8).map((country) => (
                      <span key={country.code} className="text-lg">{country.flag}</span>
                    ))}
                    {plan.countries.length > 8 && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        +{plan.countries.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <Button
                  variant="ghost"
                  onClick={() => toggleMobileExpansion(plan.id)}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <span>View Features</span>
                  {expandedMobile === plan.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {expandedMobile === plan.id && (
                  <div className="space-y-3 mb-6 animate-fade-in">
                    {Object.entries(featureLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">{label}</span>
                        <div>{renderFeatureValue(plan.features[key as keyof typeof plan.features])}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button className="w-full bg-palop-green hover:bg-palop-green/90 text-white font-semibold" asChild>
                  <Link to={`/purchase?plan=${plan.id}`}>Choose {plan.clusterName}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.popular ? 'border-2 border-palop-blue scale-105' : 'border border-gray-200'} flex flex-col`}>
                {plan.popular && (
                  <div className="absolute -top-3 right-4 bg-palop-blue text-white px-3 py-1 text-xs font-bold rounded-full z-10">
                    Most Popular
                  </div>
                )}
                
                <Badge className={`absolute -top-2 left-4 ${plan.badgeColor} text-white text-xs z-10 font-semibold`}>
                  {plan.clusterName}
                </Badge>
                
                <CardHeader className={`${plan.color} text-white text-center py-6 pt-8 flex-shrink-0`}>
                  <CardTitle className="text-lg font-bold leading-tight">{plan.name}</CardTitle>
                  <div className="text-sm opacity-90 mb-2">{plan.data} • {plan.duration}</div>
                  <div className="text-2xl font-bold mb-4">{plan.price}</div>
                  
                  {/* Coverage Countries */}
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs opacity-80 mb-2">Coverage</p>
                    <div className="flex flex-wrap gap-1 justify-center max-h-12 overflow-y-auto">
                      {plan.countries.slice(0, 6).map((country) => (
                        <span key={country.code} className="text-sm">{country.flag}</span>
                      ))}
                      {plan.countries.length > 6 && (
                        <span className="text-xs bg-white/20 px-1 py-0.5 rounded">
                          +{plan.countries.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 flex-grow flex flex-col">
                  <div className="space-y-4 flex-grow">
                    {Object.entries(featureLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium text-left">{label}</span>
                        <div className="flex justify-end">{renderFeatureValue(plan.features[key as keyof typeof plan.features])}</div>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-palop-green hover:bg-palop-green/90 text-white font-semibold mt-6" asChild>
                    <Link to={`/purchase?plan=${plan.id}`}>Choose {plan.clusterName}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanComparison;
