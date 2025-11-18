import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, Phone, MapPin, Users, TrendingUp, Star, Zap, Clock } from "lucide-react";
import CountryDetailModal from "./CountryDetailModal";
import RegionalDiasporaCoverageCard from "./RegionalDiasporaCoverageCard";

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
    features: ["4G/LTE", "Voice Roaming", "SMS", "Data Plans"],
    rating: 4.7,
    speed: "85 Mbps",
    reliability: "98.2%",
    connectedUsers: "12K+",
    popularAreas: ["Luanda", "Benguela", "Huambo", "Lobito"]
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
    features: ["4G/LTE", "Voice Roaming", "SMS", "Data Plans"],
    rating: 4.9,
    speed: "92 Mbps",
    reliability: "99.1%",
    connectedUsers: "8K+",
    popularAreas: ["Praia", "Mindelo", "Santa Maria", "Assomada"]
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
    features: ["3G/4G", "Voice Roaming", "SMS", "Data Plans"],
    rating: 4.4,
    speed: "67 Mbps",
    reliability: "96.8%",
    connectedUsers: "3K+",
    popularAreas: ["Bissau", "Bafatá", "Gabú", "Bijagós"]
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
    features: ["4G/LTE", "Voice Roaming", "SMS", "Data Plans"],
    rating: 4.6,
    speed: "78 Mbps",
    reliability: "97.5%",
    connectedUsers: "15K+",
    popularAreas: ["Maputo", "Beira", "Nampula", "Inhaca"]
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
    features: ["4G/LTE", "Voice Roaming", "SMS", "Data Plans"],
    rating: 4.8,
    speed: "88 Mbps",
    reliability: "98.7%",
    connectedUsers: "2K+",
    popularAreas: ["São Tomé", "Príncipe", "Santana", "Neves"]
  }
];

const CountriesGrid = () => {
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCountryClick = (country: any) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCountry(null);
  };

  return (
    <section id="countries-grid" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Detailed Country Insights</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive coverage information, cultural insights, and network partnerships for each PALOP country.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {countries.map((country) => (
            <Card key={country.id} className="card-hover cursor-pointer" onClick={() => handleCountryClick(country)}>
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

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(country.rating) ? 'fill-palop-yellow text-palop-yellow' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{country.rating}</span>
                  <span className="text-xs text-gray-500">({country.connectedUsers} users)</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600">{country.description}</p>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-palop-green/10 rounded-lg">
                    <Zap className="h-5 w-5 text-palop-green mx-auto mb-1" />
                    <div className="font-bold">{country.speed}</div>
                    <div className="text-gray-600">Avg Speed</div>
                  </div>
                  <div className="text-center p-3 bg-palop-blue/10 rounded-lg">
                    <Clock className="h-5 w-5 text-palop-blue mx-auto mb-1" />
                    <div className="font-bold">{country.reliability}</div>
                    <div className="text-gray-600">Reliability</div>
                  </div>
                  <div className="text-center p-3 bg-palop-yellow/10 rounded-lg">
                    <Users className="h-5 w-5 text-palop-green mx-auto mb-1" />
                    <div className="font-bold">{country.connectedUsers}</div>
                    <div className="text-gray-600">Users</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-palop-blue" />
                    <span>{country.population}</span>
                  </div>
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 mr-1 text-palop-green" />
                    <span>{country.partners.length} Partners</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Network Partners:</h4>
                  <div className="flex flex-wrap gap-2">
                    {country.partners.map((partner, index) => (
                      <Badge 
                        key={index} 
                        className="bg-palop-green/10 text-palop-green text-xs"
                      >
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Popular Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {country.popularAreas.map((area, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="text-xs"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full bg-palop-green hover:bg-palop-green/90">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Explore {country.name}
                </Button>
              </CardContent>
            </Card>
          ))}

          <RegionalDiasporaCoverageCard />
        </div>

        <CountryDetailModal 
          country={selectedCountry}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </section>
  );
};

export default CountriesGrid;
