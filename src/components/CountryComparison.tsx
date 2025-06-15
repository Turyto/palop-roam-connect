
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wifi, Users, MapPin, Star, Zap } from "lucide-react";

const countries = [
  {
    id: "angola",
    name: "Angola",
    flag: "🇦🇴",
    coverage: "98%",
    speed: "85 Mbps",
    reliability: "98.2%",
    population: "32.9M",
    partners: 3,
    planPrice: "€12.50",
    features: ["4G/LTE", "Voice", "SMS", "Data"],
    rating: 4.7
  },
  {
    id: "cape-verde",
    name: "Cape Verde",
    flag: "🇨🇻",
    coverage: "95%",
    speed: "92 Mbps",
    reliability: "99.1%",
    population: "561K",
    partners: 2,
    planPrice: "€10.00",
    features: ["4G/LTE", "Voice", "SMS", "Data"],
    rating: 4.9
  },
  {
    id: "guinea-bissau",
    name: "Guinea-Bissau",
    flag: "🇬🇼",
    coverage: "90%",
    speed: "67 Mbps",
    reliability: "96.8%",
    population: "2.0M",
    partners: 2,
    planPrice: "€8.50",
    features: ["3G/4G", "Voice", "SMS", "Data"],
    rating: 4.4
  },
  {
    id: "mozambique",
    name: "Mozambique",
    flag: "🇲🇿",
    coverage: "94%",
    speed: "78 Mbps",
    reliability: "97.5%",
    population: "31.3M",
    partners: 3,
    planPrice: "€11.00",
    features: ["4G/LTE", "Voice", "SMS", "Data"],
    rating: 4.6
  },
  {
    id: "sao-tome",
    name: "São Tomé and Príncipe",
    flag: "🇸🇹",
    coverage: "92%",
    speed: "88 Mbps",
    reliability: "98.7%",
    population: "219K",
    partners: 2,
    planPrice: "€9.00",
    features: ["4G/LTE", "Voice", "SMS", "Data"],
    rating: 4.8
  }
];

const CountryComparison = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const handleCountrySelect = (countryId: string) => {
    if (selectedCountries.includes(countryId)) {
      setSelectedCountries(selectedCountries.filter(id => id !== countryId));
    } else if (selectedCountries.length < 3) {
      setSelectedCountries([...selectedCountries, countryId]);
    }
  };

  const selectedCountryData = countries.filter(country => 
    selectedCountries.includes(country.id)
  );

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Countries</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compare network coverage, speeds, and pricing across PALOP countries to plan your perfect connectivity solution.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Select up to 3 countries to compare:</h3>
          <div className="flex flex-wrap gap-3">
            {countries.map((country) => (
              <Button
                key={country.id}
                variant={selectedCountries.includes(country.id) ? "default" : "outline"}
                onClick={() => handleCountrySelect(country.id)}
                disabled={!selectedCountries.includes(country.id) && selectedCountries.length >= 3}
                className="flex items-center space-x-2"
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {selectedCountryData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCountryData.map((country) => (
              <Card key={country.id} className="relative">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{country.flag}</div>
                  <CardTitle className="text-xl">{country.name}</CardTitle>
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(country.rating) ? 'fill-palop-yellow text-palop-yellow' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">{country.rating}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-palop-green/10 rounded-lg">
                      <Wifi className="h-5 w-5 text-palop-green mx-auto mb-1" />
                      <div className="font-bold">{country.coverage}</div>
                      <div className="text-gray-600">Coverage</div>
                    </div>
                    <div className="text-center p-3 bg-palop-blue/10 rounded-lg">
                      <Zap className="h-5 w-5 text-palop-blue mx-auto mb-1" />
                      <div className="font-bold">{country.speed}</div>
                      <div className="text-gray-600">Avg Speed</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reliability</span>
                      <span className="font-medium">{country.reliability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Population</span>
                      <span className="font-medium">{country.population}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network Partners</span>
                      <span className="font-medium">{country.partners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starting Price</span>
                      <span className="font-bold text-palop-green">{country.planPrice}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Available Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {country.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
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
        )}

        {selectedCountryData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Select countries above to start comparing</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CountryComparison;
