
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Gift, Shield, Globe } from "lucide-react";

const scenarios = [
  {
    planId: "lite",
    persona: "Tourist - Maria",
    scenario: "Maria flies from Lisbon to Mindelo, Cape Verde for 7 days to explore the islands. She activates her Lite plan on arrival at the airport using the QR code.",
    countries: ["Cape Verde", "Portugal (hub)"],
    duration: "7 days",
    dataUse: "1-2 GB",
    keyFeatures: ["QR-code activation", "Airport availability", "Tourist hotspots"],
    color: "bg-palop-blue"
  },
  {
    planId: "core",
    persona: "Diaspora - João",
    scenario: "João visits family in Luanda for 30 days. His cousin in Portugal tops up his plan via WhatsApp when he needs extra data for video calls home.",
    countries: ["Angola", "Portugal", "Cape Verde"],
    duration: "30 days", 
    dataUse: "3-5 GB",
    keyFeatures: ["Diaspora gifting", "Family connectivity", "SMS welcome pack"],
    color: "bg-palop-green"
  },
  {
    planId: "plus",
    persona: "Business - Ana",
    scenario: "Ana travels between Maputo, Luanda, and Cape Town for business meetings over 30 days. She needs reliable connectivity for video conferences and file sharing.",
    countries: ["Mozambique", "Angola", "South Africa", "Cape Verde"],
    duration: "30 days",
    dataUse: "10 GB", 
    keyFeatures: ["PALOP+ roaming", "Priority support", "Business reliability"],
    color: "bg-palop-yellow"
  },
  {
    planId: "ngo",
    persona: "NGO - Carlos",
    scenario: "Carlos leads a multi-country health mission across PALOP countries. His team uses multiple SIMs with centralized data management and usage controls.",
    countries: ["All PALOP", "Regional hubs"],
    duration: "60+ days",
    dataUse: "10+ GB",
    keyFeatures: ["Multi-SIM support", "Usage control", "Field operations"],
    color: "bg-palop-red"
  },
  {
    planId: "local-cplp",
    persona: "CPLP Traveler - Pedro",
    scenario: "Pedro travels within CPLP countries for cultural exchange programs. His plan provides affordable connectivity across Portuguese-speaking nations.",
    countries: ["CPLP Countries", "Brazil", "Portugal"],
    duration: "22 days",
    dataUse: "3-5 GB",
    keyFeatures: ["CPLP roaming", "Cultural exchange", "Low-cost parity"],
    color: "bg-gray-600"
  }
];

const connectionMatrix = [
  { plan: "Lite", coverage: "CV, STP", useCase: "Tourism, festivals, beach holidays" },
  { plan: "Core", coverage: "CV, AO, GWB + EU hubs", useCase: "Family visits, diaspora top-ups" },
  { plan: "Plus", coverage: "MZ, AO, CV, SA, PT", useCase: "Cross-border business, NGOs" },
  { plan: "NGO Pack", coverage: "All PALOP + Global", useCase: "Multi-country missions, UN teams" },
  { plan: "Local CPLP", coverage: "CPLP Countries", useCase: "Cultural exchange, education" }
];

const benefits = [
  { icon: <Globe className="h-5 w-5" />, title: "Regional Roaming", desc: "Seamless connectivity across borders" },
  { icon: <Gift className="h-5 w-5" />, title: "Gift & Top-up", desc: "Family can support from anywhere" },
  { icon: <Shield className="h-5 w-5" />, title: "Trusted Network", desc: "Reliable PALOP partnerships" },
  { icon: <Users className="h-5 w-5" />, title: "Community Connect", desc: "Building diaspora bridges" }
];

const RealJourneysSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            📶 Where Our Plans Work — Real Journeys, Real Impact
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Discover how each PalopRoam plan serves real travelers across the PALOP region, 
            connecting communities and enabling seamless communication from Cape Verde to Mozambique.
          </p>
        </div>

        {/* Usage Scenario Tiles */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">Real User Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <Card key={scenario.planId} className="card-hover">
                <CardHeader className={`${scenario.color} text-white rounded-t-lg`}>
                  <CardTitle className="text-lg">{scenario.persona}</CardTitle>
                  <div className="text-sm opacity-90">
                    {scenario.duration} • {scenario.dataUse}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    {scenario.scenario}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-palop-green mr-2" />
                      <span className="text-sm font-medium">Coverage:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {scenario.countries.map((country, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {scenario.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-palop-green rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Country Connection Visual */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">PALOP Connectivity Network</h3>
          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="text-center mb-6">
              <img 
                src="/lovable-uploads/017bc499-3373-4458-ab12-cd2c5d97ab0c.png" 
                alt="PALOP Region Map" 
                className="mx-auto max-w-full h-64 object-contain opacity-80"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-palop-blue/10 rounded-lg">
                <h4 className="font-semibold text-palop-blue mb-2">Cape Verde</h4>
                <p className="text-sm text-gray-600">Tourism Hub</p>
              </div>
              <div className="p-4 bg-palop-green/10 rounded-lg">
                <h4 className="font-semibold text-palop-green mb-2">Angola</h4>
                <p className="text-sm text-gray-600">Business Gateway</p>
              </div>
              <div className="p-4 bg-palop-yellow/10 rounded-lg">
                <h4 className="font-semibold text-palop-yellow mb-2">Mozambique</h4>
                <p className="text-sm text-gray-600">Southern Corridor</p>
              </div>
              <div className="p-4 bg-palop-red/10 rounded-lg">
                <h4 className="font-semibold text-palop-red mb-2">Guinea-Bissau</h4>
                <p className="text-sm text-gray-600">West Africa Link</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Connection Matrix */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">Plan Coverage Matrix</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Plan Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Coverage Countries
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Key Use Case
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {connectionMatrix.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.plan}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{item.coverage}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{item.useCase}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Benefit Highlights */}
        <div>
          <h3 className="text-2xl font-semibold mb-8 text-center">Why Choose PalopRoam</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-center w-12 h-12 bg-palop-green/10 rounded-full mx-auto mb-4">
                  <div className="text-palop-green">
                    {benefit.icon}
                  </div>
                </div>
                <h4 className="font-semibold mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealJourneysSection;
