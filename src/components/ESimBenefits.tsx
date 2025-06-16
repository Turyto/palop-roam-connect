
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Zap, Globe, Smartphone, CreditCard } from "lucide-react";

const ESimBenefits = () => {
  const benefits = [
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Get connected in under 2 minutes",
      traditional: "Wait for physical delivery",
      esim: "Instant QR code delivery"
    },
    {
      icon: Globe,
      title: "Global Mobility",
      description: "Perfect for frequent travelers",
      traditional: "Swap SIMs at borders",
      esim: "Seamless roaming"
    },
    {
      icon: Smartphone,
      title: "Multiple Lines",
      description: "Use multiple carriers simultaneously",
      traditional: "One SIM, one carrier",
      esim: "Multiple eSIM profiles"
    },
    {
      icon: CreditCard,
      title: "Cost Effective",
      description: "No shipping fees or physical costs",
      traditional: "Shipping & handling fees",
      esim: "Digital delivery only"
    }
  ];

  const comparison = [
    {
      feature: "Activation Time",
      traditional: "3-7 days delivery",
      esim: "Instant (2 minutes)"
    },
    {
      feature: "Physical Handling",
      traditional: "Can be lost or damaged",
      esim: "Digital - no loss risk"
    },
    {
      feature: "Travel Convenience",
      traditional: "Carry multiple SIM cards",
      esim: "All plans in one device"
    },
    {
      feature: "Environmental Impact",
      traditional: "Plastic cards + packaging",
      esim: "100% digital - eco-friendly"
    },
    {
      feature: "Device Compatibility",
      traditional: "Works with any unlocked phone",
      esim: "Requires eSIM-compatible device"
    },
    {
      feature: "Plan Switching",
      traditional: "Physical SIM swap required",
      esim: "Switch in device settings"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose eSIM for PALOP Travel?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover the advantages of eSIM technology for seamless connectivity 
            across Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="text-center card-hover">
                <CardHeader>
                  <div className="w-12 h-12 bg-palop-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-palop-green" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{benefit.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-red-600">
                      <X className="h-4 w-4 mr-2" />
                      <span className="text-gray-500">Traditional: {benefit.traditional}</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-2" />
                      <span className="text-gray-700">eSIM: {benefit.esim}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Comparison */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Traditional SIM vs eSIM Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Traditional SIM</th>
                  <th className="text-center py-4 px-4 font-semibold text-palop-green">eSIM</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium text-gray-900">{item.feature}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{item.traditional}</td>
                    <td className="py-4 px-4 text-center text-palop-green font-medium">{item.esim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-palop-green to-palop-blue rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Experience the Future of Connectivity
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Join the eSIM revolution and enjoy hassle-free connectivity across all PALOP countries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-palop-green hover:bg-gray-100 px-8 py-3 rounded-md font-medium transition-colors">
                View Our Plans
              </button>
              <button className="border border-white text-white hover:bg-white/10 px-8 py-3 rounded-md font-medium transition-colors">
                Check Compatibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ESimBenefits;
