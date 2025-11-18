
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Music, Users, Globe, Camera, MessageCircle } from "lucide-react";

const CulturalConnectivity = () => {
  const stories = [
    {
      country: "Cape Verde",
      flag: "🇨🇻",
      title: "Morabeza Digital",
      story: "Maria shares her morna music sessions from Mindelo with her family in Boston, keeping the Cape Verdean spirit alive across oceans through crystal-clear video calls.",
      icon: <Music className="h-6 w-6" />,
      color: "bg-blue-500",
      gradient: "from-blue-100 to-cyan-100"
    },
    {
      country: "Angola",
      flag: "🇦🇴",
      title: "Kizomba Connections",
      story: "João teaches kizomba dance online to Angolan communities worldwide, sharing the rhythm of Luanda streets with diaspora dancers from Lisbon to Toronto.",
      icon: <Users className="h-6 w-6" />,
      color: "bg-red-500",
      gradient: "from-red-100 to-orange-100"
    },
    {
      country: "Mozambique",
      flag: "🇲🇿",
      title: "Marrabenta Memories",
      story: "Ana livestreams traditional marrabenta performances from Maputo, connecting three generations of her family scattered across Portugal, Brazil, and South Africa.",
      icon: <Camera className="h-6 w-6" />,
      color: "bg-green-500",
      gradient: "from-green-100 to-emerald-100"
    },
    {
      country: "Guinea-Bissau",
      flag: "🇬🇼",
      title: "Gumbé Gatherings",
      story: "Carlos organizes virtual gumbé music sessions, uniting Bissau-Guinean musicians in France with traditional drummers back home in the Bijagós Islands.",
      icon: <Globe className="h-6 w-6" />,
      color: "bg-yellow-500",
      gradient: "from-yellow-100 to-amber-100"
    },
    {
      country: "São Tomé and Príncipe",
      flag: "🇸🇹",
      title: "Ússua Stories",
      story: "Elena shares stories and ússua dance traditions via video calls, teaching São Toméan children in diaspora about their island heritage and Forro culture.",
      icon: <Heart className="h-6 w-6" />,
      color: "bg-purple-500",
      gradient: "from-purple-100 to-violet-100"
    }
  ];

  const impactStats = [
    { number: "10K+", label: "Families Connected", icon: <Users className="h-5 w-5" /> },
    { number: "50+", label: "Cultural Events", icon: <Music className="h-5 w-5" /> },
    { number: "5", label: "Countries United", icon: <Globe className="h-5 w-5" /> },
    { number: "25K+", label: "Stories Shared", icon: <MessageCircle className="h-5 w-5" /> }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Cultural Connectivity</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            More than just data plans - we're connecting hearts, preserving traditions, and strengthening the bonds that unite the PALOP diaspora worldwide.
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-palop-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="text-palop-green">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-palop-green">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Cultural Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden card-hover">
              <div className={`h-2 bg-gradient-to-r ${story.gradient}`}></div>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{story.flag}</span>
                  <div>
                    <h3 className="font-bold text-lg">{story.title}</h3>
                    <p className="text-sm text-gray-500">{story.country}</p>
                  </div>
                </div>
                
                <div className={`w-12 h-12 ${story.color} rounded-full flex items-center justify-center mb-4`}>
                  <div className="text-white">
                    {story.icon}
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-sm mb-4">
                  {story.story}
                </p>
                
                <Button variant="outline" size="sm" className="w-full border-palop-green text-palop-green hover:bg-palop-green/10">
                  Read Full Story
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-palop-green/10 via-palop-yellow/10 to-palop-red/10 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Share Your Cultural Connection Story</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            How has staying connected helped you preserve and share your PALOP heritage? Join our community and inspire others with your story.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-palop-green hover:bg-palop-green/90">
              Share Your Story
            </Button>
            <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10">
              View All Stories
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CulturalConnectivity;
