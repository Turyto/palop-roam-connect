
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Star, Filter, Search, Users, Award } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const PartnersSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  const partners = [
    {
      id: 1,
      name: "Sofia's Place",
      location: "Lisbon – São Bento",
      city: "Lisbon",
      country: "Angola, Cabo Verde, Guiné Bissau",
      contact: "Phone: +351 21 342 1858",
      contactType: "phone",
      partnership: "Offer a branded flyer/QR code on tables + free eSIM for customers with meal purchase",
      type: "Restaurant",
      rating: 4.8,
      monthlyCustomers: 450,
      specialOffer: "10% off meals + Free eSIM trial",
      featured: true
    },
    {
      id: 2,
      name: "Associação Caboverdiana",
      location: "Lisbon – Rua Duque de Palmela",
      city: "Lisbon",
      country: "Cabo Verde",
      contact: "Email/Facebook (institutional)",
      contactType: "email",
      partnership: "Co-launch community awareness sessions or eSIM literacy events for diaspora members",
      type: "Association",
      rating: 4.9,
      monthlyCustomers: 200,
      specialOffer: "Free eSIM setup workshops",
      featured: true
    },
    {
      id: 3,
      name: "Fox Coffee – Rei da Cachupa",
      location: "Lisbon – Rua António Pedro",
      city: "Lisbon",
      country: "Cabo Verde",
      contact: "Facebook + in-person",
      contactType: "social",
      partnership: "Promote eSIM through table-top signs and loyalty cards with discounts on coffee + data",
      type: "Café",
      rating: 4.7,
      monthlyCustomers: 320,
      specialOffer: "Coffee + Data bundle deals"
    },
    {
      id: 4,
      name: "Mambo Lx",
      location: "Lisbon – Rua da Silva",
      city: "Lisbon",
      country: "Angola",
      contact: "Instagram/Facebook",
      contactType: "social",
      partnership: "Sponsored event night or dance party co-branded with PALOP Roam Connect for exposure",
      type: "Entertainment",
      rating: 4.6,
      monthlyCustomers: 180,
      specialOffer: "Exclusive event discounts"
    },
    {
      id: 5,
      name: "Casa de Angola",
      location: "Lisbon – Travessa da Fábrica das Sedas",
      city: "Lisbon",
      country: "Angola",
      contact: "Institutional email",
      contactType: "email",
      partnership: "Set up a referral-based ambassador program for their youth/student events",
      type: "Cultural Center",
      rating: 4.9,
      monthlyCustomers: 150,
      specialOffer: "Student eSIM discounts"
    },
    {
      id: 6,
      name: "Cantinho da Nono",
      location: "Damaia",
      city: "Damaia",
      country: "Guiné Bissau",
      contact: "In-person / phone recommended",
      contactType: "phone",
      partnership: "Mini display stand + digital QR code at counter offering special discounts to travelers",
      type: "Restaurant",
      rating: 4.5,
      monthlyCustomers: 280,
      specialOffer: "Travel eSIM packages"
    },
    {
      id: 7,
      name: "Mesa Kreol",
      location: "Lisbon – Arco Portas do Mar",
      city: "Lisbon",
      country: "Cabo Verde",
      contact: "Social media or walk-in",
      contactType: "social",
      partnership: "Jointly host \"diaspora nights\" featuring PALOP stories and offering free eSIM demos",
      type: "Restaurant",
      rating: 4.8,
      monthlyCustomers: 380,
      specialOffer: "Diaspora night specials"
    },
    {
      id: 8,
      name: "Tambarina",
      location: "Lisbon – Rua do Poço dos Negros",
      city: "Lisbon",
      country: "Cabo Verde",
      contact: "Facebook",
      contactType: "social",
      partnership: "Bundle: offer eSIM discount with every meal above €15 — plus social media cross-promo",
      type: "Restaurant",
      rating: 4.7,
      monthlyCustomers: 420,
      specialOffer: "Meal + eSIM combos"
    },
    {
      id: 9,
      name: "Kamba Restaurant",
      location: "Seixal",
      city: "Seixal",
      country: "Angola",
      contact: "+351 21 250 5551",
      contactType: "phone",
      partnership: "Video screen or tablet demo at counter, showing how easy it is to install an eSIM",
      type: "Restaurant",
      rating: 4.6,
      monthlyCustomers: 250,
      specialOffer: "eSIM installation support"
    },
    {
      id: 10,
      name: "Roda Viva",
      location: "Lisbon – Beco do Mexias",
      city: "Lisbon",
      country: "Moçambique",
      contact: "Social media",
      contactType: "social",
      partnership: "Host cultural storytelling nights + WiFi/eSIM giveaways for attendees from the diaspora",
      type: "Cultural Space",
      rating: 4.8,
      monthlyCustomers: 190,
      specialOffer: "Cultural event giveaways"
    }
  ];

  const partnerTypes = ["All", "Restaurant", "Café", "Association", "Cultural Center", "Entertainment", "Cultural Space"];
  const cities = ["All", ...Array.from(new Set(partners.map(p => p.city)))];

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
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

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || partner.type === selectedType;
    const matchesCity = selectedCity === "All" || partner.city === selectedCity;
    
    return matchesSearch && matchesType && matchesCity;
  });

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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search partners, locations, or countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {partnerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Partners Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="text-center bg-palop-green/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-palop-green">{partners.length}</div>
            <div className="text-sm text-gray-600">Active Partners</div>
          </div>
          <div className="text-center bg-palop-blue/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-palop-blue">{cities.length - 1}</div>
            <div className="text-sm text-gray-600">Cities Covered</div>
          </div>
          <div className="text-center bg-palop-yellow/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-palop-dark">
              {partners.reduce((sum, p) => sum + p.monthlyCustomers, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Visitors</div>
          </div>
          <div className="text-center bg-palop-green/5 p-4 rounded-lg">
            <div className="text-2xl font-bold text-palop-green">
              {(partners.reduce((sum, p) => sum + p.rating, 0) / partners.length).toFixed(1)}★
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
        
        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className={`hover:shadow-lg transition-shadow ${partner.featured ? 'ring-2 ring-palop-yellow' : ''}`}>
              {partner.featured && (
                <div className="bg-palop-yellow text-palop-dark text-xs font-bold px-3 py-1 rounded-b-lg inline-block">
                  <Award className="h-3 w-3 inline mr-1" />
                  Featured Partner
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{partner.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(partner.type)}`}>
                        {partner.type}
                      </span>
                      <div className="flex items-center text-sm text-yellow-500">
                        <Star className="h-3 w-3 fill-current mr-1" />
                        {partner.rating}
                      </div>
                    </div>
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

                <div className="text-sm">
                  <span className="font-semibold text-palop-green">Monthly Visitors: </span>
                  <span>{partner.monthlyCustomers}+</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getContactIcon(partner.contactType)}
                  <span>{partner.contact}</span>
                </div>

                {partner.specialOffer && (
                  <div className="bg-palop-yellow/10 border border-palop-yellow/20 rounded-lg p-3">
                    <div className="text-xs font-semibold text-palop-dark mb-1">Special Offer</div>
                    <div className="text-sm text-palop-dark">{partner.specialOffer}</div>
                  </div>
                )}
                
                <div className="pt-2">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold text-palop-green">Partnership: </span>
                    {partner.partnership}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="bg-palop-green hover:bg-palop-green/90 flex-1">
                    Visit
                  </Button>
                  <Button size="sm" variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No partners found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setSelectedType("All");
                setSelectedCity("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Interested in becoming a community partner? Let's work together to strengthen our network.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-palop-green hover:bg-palop-green/90 text-white px-8 py-3">
              Become a Partner
            </Button>
            <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10">
              Partner Benefits
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
