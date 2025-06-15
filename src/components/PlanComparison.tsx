
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PlanComparison = () => {
  const features = [
    { name: "Data Allowance", lite: "1-2 GB", core: "3-5 GB", plus: "10 GB", ngo: "10+ GB", cplp: "3-5 GB" },
    { name: "Validity Period", lite: "7 days", core: "30 days", plus: "30 days", ngo: "30-90 days", cplp: "15-30 days" },
    { name: "QR Activation", lite: true, core: true, plus: true, ngo: true, cplp: true },
    { name: "Airport Availability", lite: true, core: false, plus: true, ngo: false, cplp: false },
    { name: "Diaspora Gifting", lite: false, core: true, plus: true, ngo: false, cplp: false },
    { name: "PALOP+ Roaming", lite: false, core: false, plus: true, ngo: true, cplp: false },
    { name: "CPLP Coverage", lite: false, core: false, plus: false, ngo: true, cplp: true },
    { name: "Priority Support", lite: false, core: false, plus: true, ngo: true, cplp: false },
    { name: "Multi-SIM Support", lite: false, core: false, plus: false, ngo: true, cplp: false },
    { name: "Usage Controls", lite: false, core: false, plus: false, ngo: true, cplp: false },
  ];

  const plans = [
    { id: "lite", name: "Lite", price: "€6.00", color: "bg-palop-blue", popular: false },
    { id: "core", name: "Core", price: "€12.50", color: "bg-palop-green", popular: true },
    { id: "plus", name: "Plus", price: "€27.50", color: "bg-palop-yellow", popular: false },
    { id: "ngo", name: "NGO Pack", price: "€20-50", color: "bg-palop-red", popular: false },
    { id: "cplp", name: "Local CPLP", price: "€5-10", color: "bg-gray-600", popular: false },
  ];

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-4 w-4 text-palop-green mx-auto" />
      ) : (
        <X className="h-4 w-4 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
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

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Plan headers */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <div className="font-semibold text-gray-700">Features</div>
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? 'border-2 border-palop-green' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-palop-green text-white px-3 py-1 text-xs font-bold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className={`${plan.color} text-white text-center py-4`}>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-xl font-bold">{plan.price}</div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Feature comparison */}
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700">{feature.name}</div>
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
                    <Link to={`/purchase?plan=${plan.id}`}>Choose {plan.name}</Link>
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
