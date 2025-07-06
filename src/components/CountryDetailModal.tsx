import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Wifi, MapPin, Users, Plane, Building, Clock, TrendingUp, MessageCircle, Calendar, DollarSign, MapIcon } from "lucide-react";

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

  const cultureData = {
    "Mozambique": {
      "countryCode": "MZ",
      "countryName": "Mozambique",
      "languageSection": {
        "primaryLanguages": ["Portuguese", "Emakhuwa"],
        "commonPhrases": [
          { "phrase": "Bom dia", "meaning": "Good morning", "phonetic": "bohm DEE-ah" },
          { "phrase": "Obrigado/a", "meaning": "Thank you", "phonetic": "oh-bree-GAH-doo" }
        ],
        "etiquetteNote": "Greet people politely; show respect in traditional communities."
      },
      "eventsSection": [
        { "eventName": "AZGO Festival", "description": "Annual music festival in Maputo celebrating African sounds." },
        { "eventName": "Chopi Music Festival", "description": "Traditional event featuring Chopi timbila performances." }
      ],
      "priceIndex": {
        "tourist": [
          {"item": "Street food meal", "priceExample": "€2"},
          {"item": "Bottled water", "priceExample": "€0.40"},
          {"item": "Local bus fare", "priceExample": "€0.30"}
        ],
        "business": [
          {"item": "Car rental (per day)", "priceExample": "€35"},
          {"item": "Wi-Fi (per day)", "priceExample": "€5"}
        ],
        "expat": [
          {"item": "Monthly rent (1BR)", "priceExample": "€400"},
          {"item": "Groceries (basic basket)", "priceExample": "€65"}
        ]
      },
      "tipsSection": [
        "Shop at Mercado Central for fresh produce and souvenirs.",
        "Try street food for tasty, cheap meals.",
        "Use 'Lojas Chineses' for a wide variety of low-cost goods.",
        "Avoid touristy restaurants to save money."
      ],
      "dataSources": ["REST Countries", "Tatoeba", "Nager.Date", "Open Food Facts"]
    },
    "Angola": {
      "languageSection": {
        "primaryLanguages": ["Portuguese", "Kimbundu"],
        "commonPhrases": [
          { "phrase": "Bom dia", "meaning": "Good morning", "phonetic": "bohm DEE-ah" },
          { "phrase": "Obrigado/a", "meaning": "Thank you", "phonetic": "oh-bree-GAH-doo" }
        ],
        "etiquetteNote": "Respect for elders is very important; greet with a handshake."
      },
      "eventsSection": [
        { "eventName": "Luanda Jazz Festival", "description": "International jazz festival attracting world-class musicians." },
        { "eventName": "Carnival of Luanda", "description": "Vibrant street celebration with music and dance." }
      ],
      "priceIndex": {
        "tourist": [
          {"item": "Street food meal", "priceExample": "€3"},
          {"item": "Bottled water", "priceExample": "€0.50"},
          {"item": "Local transport", "priceExample": "€0.40"}
        ],
        "business": [
          {"item": "Hotel room", "priceExample": "€80"},
          {"item": "Business lunch", "priceExample": "€15"}
        ],
        "expat": [
          {"item": "Monthly rent", "priceExample": "€800"},
          {"item": "Groceries", "priceExample": "€120"}
        ]
      },
      "tipsSection": [
        "Luanda can be expensive; budget accordingly.",
        "Try local markets for authentic experiences.",
        "Cash is preferred in many places.",
        "Learn basic Portuguese phrases."
      ]
    }
  };

  const currentCultureData = cultureData[country.name as keyof typeof cultureData] || cultureData["Angola"];

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
            <div className="bg-gradient-to-br from-palop-yellow/5 via-palop-green/5 to-palop-blue/5 p-6 rounded-lg space-y-6">
              
              {/* Language & Communication Section */}
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-green/20">
                <h4 className="font-semibold mb-3 flex items-center text-palop-green">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Language & Communication
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Primary Languages</h5>
                    <div className="flex flex-wrap gap-2">
                      {currentCultureData.languageSection.primaryLanguages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="bg-palop-green/10 text-palop-green border-palop-green/30">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Common Phrases</h5>
                    <div className="space-y-2">
                      {currentCultureData.languageSection.commonPhrases.map((phrase, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-palop-green">"{phrase.phrase}"</span> - {phrase.meaning}
                          <div className="text-xs text-gray-500 italic">({phrase.phonetic})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 italic">{currentCultureData.languageSection.etiquetteNote}</p>
                </div>
              </div>

              {/* Events & Festivals Section */}
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-blue/20">
                <h4 className="font-semibold mb-3 flex items-center text-palop-blue">
                  <Calendar className="w-5 h-5 mr-2" />
                  Events & Festivals
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCultureData.eventsSection.map((event, index) => (
                    <div key={index} className="bg-white/40 p-3 rounded border border-palop-blue/10">
                      <h5 className="font-medium text-palop-blue mb-1">{event.eventName}</h5>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Index Section */}
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-yellow/20">
                <h4 className="font-semibold mb-3 flex items-center text-palop-yellow">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Price Index
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Tourist Prices */}
                  <div className="bg-white/40 p-3 rounded border border-palop-yellow/10">
                    <h5 className="font-medium text-palop-yellow mb-2 flex items-center">
                      🧳 Tourist
                    </h5>
                    <div className="space-y-2">
                      {currentCultureData.priceIndex.tourist.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.item}</span>
                          <span className="font-medium">{item.priceExample}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business Prices */}
                  <div className="bg-white/40 p-3 rounded border border-palop-yellow/10">
                    <h5 className="font-medium text-palop-yellow mb-2 flex items-center">
                      💼 Business Traveler
                    </h5>
                    <div className="space-y-2">
                      {currentCultureData.priceIndex.business.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.item}</span>
                          <span className="font-medium">{item.priceExample}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expat Prices */}
                  <div className="bg-white/40 p-3 rounded border border-palop-yellow/10">
                    <h5 className="font-medium text-palop-yellow mb-2 flex items-center">
                      🏠 Expat
                    </h5>
                    <div className="space-y-2">
                      {currentCultureData.priceIndex.expat.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.item}</span>
                          <span className="font-medium">{item.priceExample}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Localized Travel Tips Section */}
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-red/20">
                <h4 className="font-semibold mb-3 flex items-center text-palop-red">
                  <MapIcon className="w-5 h-5 mr-2" />
                  Localized Travel Tips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentCultureData.tipsSection.map((tip, index) => (
                    <div key={index} className="flex items-start bg-white/40 p-3 rounded border border-palop-red/10">
                      <div className="w-2 h-2 bg-palop-red rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources Footer (Optional - for transparency) */}
              {currentCultureData.dataSources && (
                <div className="border-t pt-4 mt-6">
                  <p className="text-xs text-gray-400">
                    Data sources: {currentCultureData.dataSources.join(", ")}
                  </p>
                </div>
              )}
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
