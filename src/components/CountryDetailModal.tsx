
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Wifi, MapPin, Users, Plane, Building, Clock, TrendingUp } from "lucide-react";

interface CountryDetailModalProps {
  country: any;
  isOpen: boolean;
  onClose: () => void;
}

const CountryDetailModal = ({ country, isOpen, onClose }: CountryDetailModalProps) => {
  if (!country) return null;

  const networkQuality = {
    "Angola": { speed: "85 Mbps", latency: "45ms", reliability: "98.2%" },
    "Cape Verde": { speed: "92 Mbps", latency: "38ms", reliability: "99.1%" },
    "Guinea-Bissau": { speed: "67 Mbps", latency: "52ms", reliability: "96.8%" },
    "Mozambique": { speed: "78 Mbps", latency: "48ms", reliability: "97.5%" },
    "São Tomé and Príncipe": { speed: "88 Mbps", latency: "42ms", reliability: "98.7%" }
  };

  const hotspots = {
    "Angola": ["Luanda Airport", "Talatona Business District", "Marginal Promenade", "Shopping Belas"],
    "Cape Verde": ["Amílcar Cabral Airport", "Mindelo Marina", "Praia City Center", "Santa Maria Beach"],
    "Guinea-Bissau": ["Bissau Airport", "Bissau Port", "Hotel Malaika", "Central Market"],
    "Mozambique": ["Maputo Airport", "Costa do Sol", "Polana Shopping", "Matola Business District"],
    "São Tomé and Príncipe": ["São Tomé Airport", "Ana Chaves Bay", "Hotel Pestana", "Central Hospital"]
  };

  const culturalInsights = {
    "Angola": "Home to vibrant semba and kizomba music. Stay connected to share your Luanda nightlife experiences and Benguela's beautiful coastline.",
    "Cape Verde": "The islands of music and morabeza hospitality. Perfect connectivity for sharing stunning Sal island sunsets and Mindelo's cultural scene.",
    "Guinea-Bissau": "Rich in Balanta and Fulani traditions. Connect with family while exploring the Bijagós Islands UNESCO biosphere reserve.",
    "Mozambique": "Where Portuguese and African cultures blend beautifully. Share your adventures from Inhaca Island to the historic Island of Mozambique.",
    "São Tomé and Príncipe": "The chocolate islands with pristine nature. Perfect for eco-tourism content sharing and connecting with sustainable travel communities."
  };

  const reviews = [
    { name: "Maria S.", rating: 5, text: "Excellent coverage in Luanda. Video calls with family were crystal clear!" },
    { name: "João P.", rating: 5, text: "Seamless roaming experience across all islands. Highly recommended!" },
    { name: "Ana L.", rating: 4, text: "Good speeds in major cities, reliable connection throughout my business trip." }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <span className="text-4xl mr-3">{country.flag}</span>
            {country.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="culture">Culture</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-palop-green/10 p-4 rounded-lg text-center">
                <Wifi className="h-8 w-8 text-palop-green mx-auto mb-2" />
                <div className="text-2xl font-bold">{networkQuality[country.name as keyof typeof networkQuality]?.speed}</div>
                <div className="text-sm text-gray-600">Avg Speed</div>
              </div>
              <div className="bg-palop-blue/10 p-4 rounded-lg text-center">
                <Clock className="h-8 w-8 text-palop-blue mx-auto mb-2" />
                <div className="text-2xl font-bold">{networkQuality[country.name as keyof typeof networkQuality]?.latency}</div>
                <div className="text-sm text-gray-600">Latency</div>
              </div>
              <div className="bg-palop-yellow/10 p-4 rounded-lg text-center">
                <TrendingUp className="h-8 w-8 text-palop-green mx-auto mb-2" />
                <div className="text-2xl font-bold">{networkQuality[country.name as keyof typeof networkQuality]?.reliability}</div>
                <div className="text-sm text-gray-600">Reliability</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-palop-green" />
                Popular Connection Hotspots
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {hotspots[country.name as keyof typeof hotspots]?.map((spot, index) => (
                  <Badge key={index} variant="outline" className="justify-start">
                    {spot}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Network Partners</h4>
              <div className="flex flex-wrap gap-2">
                {country.partners.map((partner: string, index: number) => (
                  <Badge key={index} className="bg-palop-green/10 text-palop-green">
                    {partner}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Coverage Map</h4>
              <div className="bg-gradient-to-br from-palop-green/20 to-palop-blue/20 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-palop-green mx-auto mb-4" />
                  <p className="text-gray-600">Interactive coverage map</p>
                  <p className="text-sm text-gray-500">Showing {country.coverage} national coverage</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Urban Coverage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Capital City</span>
                    <span className="font-medium">99%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Major Cities</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business Districts</span>
                    <span className="font-medium">98%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Travel Routes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Airports</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Major Highways</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tourist Areas</span>
                    <span className="font-medium">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="culture" className="space-y-6">
            <div className="bg-gradient-to-br from-palop-yellow/10 to-palop-red/10 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Cultural Connectivity</h4>
              <p className="text-gray-700 leading-relaxed">
                {culturalInsights[country.name as keyof typeof culturalInsights]}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Best Times to Visit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h5 className="font-medium text-palop-green">Peak Season</h5>
                  <p className="text-sm text-gray-600 mt-1">Higher network usage, premium support available</p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h5 className="font-medium text-palop-blue">Off Season</h5>
                  <p className="text-sm text-gray-600 mt-1">Better speeds, special discount packages</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.name}</span>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-palop-yellow text-palop-yellow" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.text}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10">
                View All Reviews
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-palop-green hover:bg-palop-green/90">
            View {country.name} Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CountryDetailModal;
