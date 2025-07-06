
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Satellite, Zap, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import CountryFlagChip from "./CountryFlagChip";
import RegionalDiasporaModal from "./RegionalDiasporaModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Show first 8 countries by default, all when expanded
  const displayedCountries = isExpanded ? regionalDiasporaCountries : regionalDiasporaCountries.slice(0, 8);
  const hasMoreCountries = regionalDiasporaCountries.length > 8;

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="card-hover cursor-pointer h-full flex flex-col" onClick={handleCardClick}>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">🌍</span>
              <div>
                <CardTitle className="text-xl">Regional & Diaspora Countries</CardTitle>
                <p className="text-sm text-gray-500 flex items-center max-w-prose">
                  <Globe className="w-4 h-4 mr-1" />
                  Extended Coverage
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-palop-blue">{regionalDiasporaCountries.length}+</div>
              <div className="text-xs text-gray-500">Countries</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col space-y-4">
          <p className="text-gray-600 max-w-prose">Extended coverage for PALOP travelers and diaspora across Africa, Europe, and CPLP countries.</p>
          
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
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

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-palop-blue" />
              <span>PALOP Communities</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-1 text-palop-green" />
              <span>Business Travel</span>
            </div>
          </div>

          {/* Separator between chips and metrics */}
          <div className="border-t border-gray-200"></div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-4 text-sm">
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

          {/* Coverage Summary */}
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">
              Connect in <strong>{regionalDiasporaCountries.length}+ additional countries</strong> where PALOP communities live, travel, or do business.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-auto pt-4">
            <Button 
              className="w-full bg-palop-blue hover:bg-palop-blue/90"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <Satellite className="w-4 h-4 mr-2" />
              Explore Regional & Diaspora Plans
            </Button>
          </div>
        </CardContent>
      </Card>

      <RegionalDiasporaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default RegionalDiasporaCoverageCard;
