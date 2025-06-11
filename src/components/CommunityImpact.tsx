
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Coffee, Calendar, Handshake } from "lucide-react";

const CommunityImpact = () => {
  const impactAreas = [
    {
      icon: <MapPin className="h-8 w-8 text-palop-green" />,
      title: "Local Businesses",
      description: "Supporting PALOP-owned restaurants, cafés, and cultural spaces that serve as community hubs in the diaspora."
    },
    {
      icon: <Coffee className="h-8 w-8 text-palop-blue" />,
      title: "Cultural Experiences",
      description: "Promoting authentic PALOP dining, music, and cultural experiences that keep our heritage alive."
    },
    {
      icon: <Calendar className="h-8 w-8 text-palop-yellow" />,
      title: "Community Events",
      description: "Hosting and sponsoring events that bring together the PALOP community for networking and celebration."
    },
    {
      icon: <Handshake className="h-8 w-8 text-palop-green" />,
      title: "Strategic Partnerships",
      description: "Building meaningful partnerships that benefit both our community and local businesses across Europe."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Community Impact</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            PALOP Roam Connect is more than just connectivity – we're building bridges between communities, supporting local businesses, and celebrating our shared heritage.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactAreas.map((area, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {area.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{area.title}</h3>
                <p className="text-gray-600">{area.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityImpact;
