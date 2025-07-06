
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Satellite, Zap, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import CountryFlagChip from "./CountryFlagChip";

const regionalDiasporaCountries = [
  // Europe & CPLP
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Luxembourg', flag: '🇱🇺' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Belgium', flag: '🇧🇪' },
  
  // Southern & Central Africa
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Botswana', flag: '🇧🇼' },
  { name: 'Namibia', flag: '🇳🇦' },
  { name: 'Tanzania', flag: '🇹🇿' },
  { name: 'DRC', flag: '🇨🇩' },
  { name: 'Republic of Congo', flag: '🇨🇬' },
  { name: 'Zambia', flag: '🇿🇲' },
  { name: 'Zimbabwe', flag: '🇿🇼' },
  
  // West Africa & Others
  { name: 'Guinea', flag: '🇬🇳' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Mauritius', flag: '🇲🇺' },
  { name: 'Madagascar', flag: '🇲🇬' },
  { name: 'Timor-Leste', flag: '🇹🇱' },
  { name: 'Macau', flag: '🇲🇴' },
  { name: 'Equatorial Guinea', flag: '🇬🇶' }
];

const RegionalDiasporaCoverageCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show first 8 countries by default, all when expanded
  const displayedCountries = isExpanded ? regionalDiasporaCountries : regionalDiasporaCountries.slice(0, 8);
  const hasMoreCountries = regionalDiasporaCountries.length > 8;

  return (
    <Card className="card-hover h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-palop-blue/10 rounded-lg">
            <Globe className="w-6 h-6 text-palop-blue" />
          </div>
          <div>
            <CardTitle className="text-xl">Regional & Diaspora Countries</CardTitle>
            <p className="text-sm text-gray-500">
              Extended coverage for PALOP travelers and diaspora
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col space-y-4">
        {/* Country Chips Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {displayedCountries.map((country, index) => (
            <CountryFlagChip
              key={index}
              name={country.name}
              flag={country.flag}
              size="sm"
            />
          ))}
        </div>

        {/* Expand/Collapse Toggle */}
        {hasMoreCountries && (
          <div className="flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-palop-blue hover:text-palop-blue/80 transition-colors text-sm font-medium"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Show fewer countries</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show all {regionalDiasporaCountries.length} countries</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Coverage Summary */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">
            Connect in <strong>{regionalDiasporaCountries.length}+ additional countries</strong> where PALOP communities live, travel, or do business.
          </p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center p-3 bg-palop-green/10 rounded-lg">
            <Zap className="h-5 w-5 text-palop-green mx-auto mb-1" />
            <div className="font-bold">~75 Mbps</div>
            <div className="text-gray-600">Avg Speed</div>
          </div>
          <div className="text-center p-3 bg-palop-blue/10 rounded-lg">
            <Clock className="h-5 w-5 text-palop-blue mx-auto mb-1" />
            <div className="font-bold">96%</div>
            <div className="text-gray-600">Avg Reliability</div>
          </div>
          <div className="text-center p-3 bg-palop-yellow/10 rounded-lg">
            <Users className="h-5 w-5 text-palop-green mx-auto mb-1" />
            <div className="font-bold">{regionalDiasporaCountries.length}+</div>
            <div className="text-gray-600">Countries</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-auto pt-4">
          <Button 
            className="w-full bg-palop-blue hover:bg-palop-blue/90"
            onClick={() => window.location.href = '/plans?cluster=regional-diaspora'}
          >
            <Satellite className="w-4 h-4 mr-2" />
            Explore Regional & Diaspora Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalDiasporaCoverageCard;
