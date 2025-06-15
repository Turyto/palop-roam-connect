
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, Phone, MapPin, Users } from "lucide-react";

const countries = [
  {
    id: 1,
    name: "Angola",
    flag: "🇦🇴",
    capital: "Luanda",
    coverage: "98%",
    population: "32.9M",
    partners: ["Unitel", "Movicel", "Africell"],
    description: "Extensive network coverage across major cities and rural areas with strong 4G infrastructure.",
    features: ["4G/LTE", "Voice Roaming", "SMS", "Data Plans"]
  },
  {
    id: 2,
    name: "Cape Verde",
    flag: "🇨🇻",
    capital: "Praia",
    coverage: "95%",
    population: "561K",
    partners: ["CVMóvel", "Unitel T+"],
    description: "Island-wide coverage with excellent connectivity across all inhabited islands.",
    features: ["4G/LTE", "Voice Roaming", "SMS", "Data Plans"]
  },
  {
    id: 3,
    name: "Guinea-Bissau",
    flag: "🇬🇼",
    capital: "Bissau",
    coverage: "90%",
    population: "2.0M",
    partners: ["MTN", "Orange"],
    description: "Growing network infrastructure with focus on urban centers and main transportation routes.",
    features: ["3G/4G", "Voice Roaming", "SMS", "Data Plans"]
  },
  {
    id: 4,
    name: "Mozambique",
    flag: "🇲🇿",
    capital: "Maputo",
    coverage: "94%",
    population: "31.3M",
    partners: ["Vodacom", "mCel", "Movitel"],
    description: "Robust network coverage along the coast and major inland cities with expanding rural reach.",
    features: ["4G/LTE", "Voice Roaming", "SMS", "Data Plans"]
  },
  {
    id: 5,
    name: "São Tomé and Príncipe",
    flag: "🇸🇹",
    capital: "São Tomé",
    coverage: "92%",
    population: "219K",
    partners: ["CST", "Unitel STP"],
    description: "Complete coverage across both islands with modern telecommunications infrastructure.",
    features: ["4G/LTE", "Voice Roaming", "SMS", "Data Plans"]
  }
];

const CountriesGrid = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Country Details</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Detailed coverage information and network partnerships for each PALOP country.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {countries.map((country) => (
            <Card key={country.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{country.flag}</span>
                    <div>
                      <CardTitle className="text-xl">{country.name}</CardTitle>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {country.capital}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-palop-green">{country.coverage}</div>
                    <div className="text-xs text-gray-500">Coverage</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600">{country.description}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-palop-blue" />
                    <span>{country.population}</span>
                  </div>
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 mr-1 text-palop-green" />
                    <span>{country.coverage} Coverage</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Network Partners:</h4>
                  <div className="flex flex-wrap gap-2">
                    {country.partners.map((partner, index) => (
                      <span 
                        key={index} 
                        className="bg-palop-green/10 text-palop-green px-2 py-1 rounded-full text-xs"
                      >
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Available Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {country.features.map((feature, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full bg-palop-green hover:bg-palop-green/90">
                  View {country.name} Plans
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesGrid;
