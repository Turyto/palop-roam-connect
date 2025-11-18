
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wifi, Users, Plane, Building, Clock, TrendingUp, Zap, Check } from "lucide-react";
import CountryFlagChip from "./CountryFlagChip";

interface RegionalDiasporaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const popularHubs = [
  "Lisbon", "Paris", "London", "Johannesburg", "Brussels", "Geneva", "Luxembourg City", "Amsterdam"
];

const usageScenarios = [
  "Connect family abroad",
  "Roam on CPLP countries", 
  "Stay online during business trips",
  "Access diaspora communities",
  "Seamless Europe travel"
];

const networkPartners = ["AirHub", "eSIM Access", "Airalo", "BNESIM"];

const RegionalDiasporaModal = ({ isOpen, onClose }: RegionalDiasporaModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <span className="text-4xl mr-3">🌍</span>
            Regional & Diaspora Plans
          </DialogTitle>
          <p className="text-gray-600 max-w-prose">
            Extended plans for PALOP travelers and diaspora in Africa, Europe, and CPLP countries.
          </p>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-palop-green/10 p-4 rounded-lg text-center">
                <Zap className="h-8 w-8 text-palop-green mx-auto mb-2" />
                <div className="text-2xl font-bold">~75 Mbps</div>
                <div className="text-sm text-gray-600">Avg Speed</div>
              </div>
              <div className="bg-palop-blue/10 p-4 rounded-lg text-center">
                <Clock className="h-8 w-8 text-palop-blue mx-auto mb-2" />
                <div className="text-2xl font-bold">96%</div>
                <div className="text-sm text-gray-600">Avg Reliability</div>
              </div>
              <div className="bg-palop-yellow/10 p-4 rounded-lg text-center">
                <Globe className="h-8 w-8 text-palop-green mx-auto mb-2" />
                <div className="text-2xl font-bold">{regionalDiasporaCountries.length}+</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>

            {/* Coverage Highlights */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-palop-blue" />
                Coverage Highlights
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {regionalDiasporaCountries.slice(0, 8).map((country, index) => (
                  <CountryFlagChip
                    key={index}
                    name={country.name}
                    flag={country.flag}
                    size="sm"
                  />
                ))}
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  + {regionalDiasporaCountries.length - 8} more countries
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              {/* Popular Hubs */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-palop-green" />
                  Popular Hubs
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {popularHubs.map((hub, index) => (
                    <Badge key={index} variant="outline" className="justify-center">
                      {hub}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Usage Scenarios */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-palop-blue" />
                  Perfect For
                </h4>
                <div className="space-y-2">
                  {usageScenarios.map((scenario, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-palop-green mr-2" />
                      <span className="text-sm">{scenario}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Network Partners */}
              <div>
                <h4 className="font-semibold mb-3">Network Partners</h4>
                <div className="flex flex-wrap gap-2">
                  {networkPartners.map((partner, index) => (
                    <Badge key={index} className="bg-palop-green/10 text-palop-green">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">All Covered Countries</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {regionalDiasporaCountries.map((country, index) => (
                  <CountryFlagChip
                    key={index}
                    name={country.name}
                    flag={country.flag}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h4 className="font-semibold mb-3">Europe & CPLP</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Major Cities</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tourist Areas</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business Districts</span>
                    <span className="font-medium">99%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Africa & Others</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Capital Cities</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Major Airports</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business Centers</span>
                    <span className="font-medium">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <div className="bg-gradient-to-br from-palop-yellow/10 to-palop-blue/10 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Best Practices for Regional Plans</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-palop-green mr-2 mt-0.5" />
                  <span className="text-sm">Activate your eSIM before traveling to ensure smooth connectivity</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-palop-green mr-2 mt-0.5" />
                  <span className="text-sm">Monitor data usage across multiple countries with our tracking tools</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-palop-green mr-2 mt-0.5" />
                  <span className="text-sm">Keep your device updated for optimal roaming performance</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-palop-green mr-2 mt-0.5" />
                  <span className="text-sm">Use our diaspora community features to connect with locals</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Maria L.</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-palop-yellow rounded-sm mr-1" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Perfect for my trips between Lisbon and Luanda. Seamless connectivity across both countries!</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">João S.</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-palop-yellow rounded-sm mr-1" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Great coverage in European diaspora communities. Helped me stay connected with family and business contacts.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            className="bg-palop-blue hover:bg-palop-blue/90"
            onClick={() => window.location.href = '/plans?cluster=regional-diaspora'}
          >
            View Available Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegionalDiasporaModal;
