
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";

const PartnersSection = () => {
  const partners = [
    {
      name: "Sofia's Place",
      location: "Lisbon – São Bento",
      country: "Angola, Cabo Verde, Guiné Bissau",
      contact: "Phone: +351 21 342 1858",
      contactType: "phone",
      partnership: "Offer a branded flyer/QR code on tables + free eSIM for customers with meal purchase",
      type: "Restaurant"
    },
    {
      name: "Associação Caboverdiana",
      location: "Lisbon – Rua Duque de Palmela",
      country: "Cabo Verde",
      contact: "Email/Facebook (institutional)",
      contactType: "email",
      partnership: "Co-launch community awareness sessions or eSIM literacy events for diaspora members",
      type: "Association"
    },
    {
      name: "Fox Coffee – Rei da Cachupa",
      location: "Lisbon – Rua António Pedro",
      country: "Cabo Verde",
      contact: "Facebook + in-person",
      contactType: "social",
      partnership: "Promote eSIM through table-top signs and loyalty cards with discounts on coffee + data",
      type: "Café"
    },
    {
      name: "Mambo Lx",
      location: "Lisbon – Rua da Silva",
      country: "Angola",
      contact: "Instagram/Facebook",
      contactType: "social",
      partnership: "Sponsored event night or dance party co-branded with PALOP Roam Connect for exposure",
      type: "Entertainment"
    },
    {
      name: "Casa de Angola",
      location: "Lisbon – Travessa da Fábrica das Sedas",
      country: "Angola",
      contact: "Institutional email",
      contactType: "email",
      partnership: "Set up a referral-based ambassador program for their youth/student events",
      type: "Cultural Center"
    },
    {
      name: "Cantinho da Nono",
      location: "Damaia",
      country: "Guiné Bissau",
      contact: "In-person / phone recommended",
      contactType: "phone",
      partnership: "Mini display stand + digital QR code at counter offering special discounts to travelers",
      type: "Restaurant"
    },
    {
      name: "Mesa Kreol",
      location: "Lisbon – Arco Portas do Mar",
      country: "Cabo Verde",
      contact: "Social media or walk-in",
      contactType: "social",
      partnership: "Jointly host \"diaspora nights\" featuring PALOP stories and offering free eSIM demos",
      type: "Restaurant"
    },
    {
      name: "Tambarina",
      location: "Lisbon – Rua do Poço dos Negros",
      country: "Cabo Verde",
      contact: "Facebook",
      contactType: "social",
      partnership: "Bundle: offer eSIM discount with every meal above €15 — plus social media cross-promo",
      type: "Restaurant"
    },
    {
      name: "Kamba Restaurant",
      location: "Seixal",
      country: "Angola",
      contact: "+351 21 250 5551",
      contactType: "phone",
      partnership: "Video screen or tablet demo at counter, showing how easy it is to install an eSIM",
      type: "Restaurant"
    },
    {
      name: "Roda Viva",
      location: "Lisbon – Beco do Mexias",
      country: "Moçambique",
      contact: "Social media",
      contactType: "social",
      partnership: "Host cultural storytelling nights + WiFi/eSIM giveaways for attendees from the diaspora",
      type: "Cultural Space"
    }
  ];

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'social':
        return <Facebook className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Restaurant':
        return 'bg-palop-green/10 text-palop-green';
      case 'Café':
        return 'bg-palop-blue/10 text-palop-blue';
      case 'Association':
        return 'bg-palop-yellow/10 text-palop-dark';
      case 'Cultural Center':
        return 'bg-palop-green/10 text-palop-green';
      case 'Entertainment':
        return 'bg-palop-blue/10 text-palop-blue';
      case 'Cultural Space':
        return 'bg-palop-yellow/10 text-palop-dark';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <section id="partners" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Community Partners</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover amazing PALOP-owned businesses and cultural spaces that are part of our growing network. 
            Each partnership creates unique opportunities for our community to stay connected while supporting local entrepreneurs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{partner.name}</CardTitle>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(partner.type)}`}>
                      {partner.type}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.location}</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-semibold text-palop-blue">Focus: </span>
                  <span>{partner.country}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getContactIcon(partner.contactType)}
                  <span>{partner.contact}</span>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-palop-green">Partnership: </span>
                    {partner.partnership}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Interested in becoming a community partner? Let's work together to strengthen our network.
          </p>
          <Button className="bg-palop-green hover:bg-palop-green/90 text-white px-8 py-3">
            Become a Partner
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
