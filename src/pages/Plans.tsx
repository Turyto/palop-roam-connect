
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Users, Briefcase, Building, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import CtaSection from "@/components/CtaSection";

const packages = [
  {
    id: "lite",
    tier: "Lite",
    targetUser: "Tourist",
    data: "1-2 GB",
    duration: "7 days",
    price: "5-7",
    icon: <Smartphone className="h-8 w-8" />,
    notes: "QR-code activation, airport availability",
    color: "bg-palop-blue",
    features: [
      "1-2 GB Data",
      "7 Days Validity",
      "QR-code activation",
      "Airport availability",
      "Tourist-friendly setup"
    ]
  },
  {
    id: "core",
    tier: "Core",
    targetUser: "Diaspora Returnee",
    data: "3-5 GB",
    duration: "30 days",
    price: "10-15",
    icon: <Users className="h-8 w-8" />,
    notes: "Diaspora gifting enabled, SMS welcome pack",
    color: "bg-palop-green",
    popular: true,
    features: [
      "3-5 GB Data",
      "30 Days Validity",
      "Diaspora gifting enabled",
      "SMS welcome pack",
      "Community support"
    ]
  },
  {
    id: "plus",
    tier: "Plus",
    targetUser: "Business Traveler",
    data: "10 GB",
    duration: "30 days",
    price: "25-30",
    icon: <Briefcase className="h-8 w-8" />,
    notes: "PALOP+ roaming, priority support",
    color: "bg-palop-yellow",
    features: [
      "10 GB Data",
      "30 Days Validity",
      "PALOP+ roaming",
      "Priority support",
      "Business-grade reliability"
    ]
  },
  {
    id: "ngo",
    tier: "NGO Pack",
    targetUser: "Field Staff / Consultants",
    data: "10+ GB",
    duration: "30-90 days",
    price: "20-50",
    icon: <Building className="h-8 w-8" />,
    notes: "Multi-SIM, usage control, partner integration",
    color: "bg-palop-red",
    features: [
      "10+ GB Data",
      "30-90 Days Validity",
      "Multi-SIM support",
      "Usage control",
      "Partner integration"
    ]
  },
  {
    id: "local-cplp",
    tier: "Local CPLP",
    targetUser: "PALOP Domestic Traveler",
    data: "3-5 GB",
    duration: "15-30 days",
    price: "5-10",
    icon: <Globe className="h-8 w-8" />,
    notes: "Phase 2 CPLP roaming model, low-cost parity",
    color: "bg-gray-600",
    features: [
      "3-5 GB Data",
      "15-30 Days Validity",
      "CPLP roaming model",
      "Low-cost parity",
      "Domestic traveler focus"
    ]
  }
];

const Plans = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Perfect Plan</h1>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Our tiered package framework is designed to serve every member of the PALOP community, 
              from tourists to business travelers, with flexible options across all countries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`card-hover relative ${pkg.popular ? 'border-2 border-palop-green' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 right-4 bg-palop-green text-white px-3 py-1 text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                
                {/* Header with tier color */}
                <div className={`${pkg.color} text-white p-6 rounded-t-lg`}>
                  <div className="flex items-center justify-center mb-3">
                    {pkg.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center">{pkg.tier}</h3>
                  <p className="text-center text-white/90 text-sm mt-1">{pkg.targetUser}</p>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">€{pkg.price}</div>
                    <div className="text-sm text-gray-600">{pkg.data} • {pkg.duration}</div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Badge variant="outline" className="w-full justify-center text-xs">
                    {pkg.notes}
                  </Badge>
                  
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-palop-green/20 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-palop-green"></div>
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full bg-palop-green hover:bg-palop-green/90" asChild>
                    <Link to="/purchase">Select Plan</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold mb-3">Package Framework Coverage</h3>
              <p className="text-gray-600">
                All packages include coverage across PALOP countries (Angola, Cape Verde, Guinea-Bissau, 
                Mozambique, São Tomé and Príncipe) with expanded roaming options based on your tier.
              </p>
            </div>
          </div>
        </section>
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Plans;
