
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Star } from "lucide-react";

const CommunityEvents = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "PALOP Business Network Meetup",
      date: "2025-01-25",
      time: "18:00",
      location: "Lisbon, Portugal",
      type: "Networking",
      attendees: 45,
      maxAttendees: 60,
      description: "Connect with PALOP entrepreneurs and business leaders in Lisbon. Share experiences, build partnerships.",
      organizer: "PALOP Entrepreneurs Association",
      featured: true
    },
    {
      id: 2,
      title: "Cape Verdean Cultural Night",
      date: "2025-02-02",
      time: "19:30",
      location: "Paris, France",
      type: "Cultural",
      attendees: 78,
      maxAttendees: 100,
      description: "An evening of Cape Verdean music, dance, and traditional food. Featuring local artists and musicians.",
      organizer: "Casa Cabo Verde Paris"
    },
    {
      id: 3,
      title: "Angolan Heritage Workshop",
      date: "2025-02-10",
      time: "14:00",
      location: "London, UK",
      type: "Educational",
      attendees: 32,
      maxAttendees: 40,
      description: "Learn about Angolan history, language, and customs. Perfect for young diaspora members.",
      organizer: "Angola Heritage Foundation"
    },
    {
      id: 4,
      title: "PALOP Tech Innovation Summit",
      date: "2025-02-18",
      time: "09:00",
      location: "Berlin, Germany",
      type: "Technology",
      attendees: 120,
      maxAttendees: 150,
      description: "Showcase tech innovations from PALOP countries. Startup pitches, panels, and networking.",
      organizer: "PALOP Tech Hub"
    },
    {
      id: 5,
      title: "Mozambican Food Festival",
      date: "2025-02-22",
      time: "12:00",
      location: "Rome, Italy",
      type: "Cultural",
      attendees: 89,
      maxAttendees: 120,
      description: "Taste authentic Mozambican cuisine, cooking demonstrations, and cultural performances.",
      organizer: "Mozambique Cultural Center"
    }
  ];

  const eventTypes = ["All", "Networking", "Cultural", "Educational", "Technology"];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Networking':
        return 'bg-palop-blue/10 text-palop-blue';
      case 'Cultural':
        return 'bg-palop-green/10 text-palop-green';
      case 'Educational':
        return 'bg-palop-yellow/10 text-palop-dark';
      case 'Technology':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section id="community-events" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Events</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join upcoming events across Europe where the PALOP community comes together to celebrate culture, 
            build connections, and support each other's growth.
          </p>
        </div>

        {/* Event Type Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {eventTypes.map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className="border-palop-green text-palop-green hover:bg-palop-green hover:text-white"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className={`hover:shadow-lg transition-shadow ${event.featured ? 'ring-2 ring-palop-yellow' : ''}`}>
              {event.featured && (
                <div className="bg-palop-yellow text-palop-dark text-xs font-bold px-3 py-1 rounded-b-lg inline-block">
                  <Star className="h-3 w-3 inline mr-1" />
                  Featured Event
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{event.time}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees}/{event.maxAttendees} attending</span>
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed">
                  {event.description}
                </p>
                
                <div className="text-xs text-gray-500 border-t pt-2">
                  Organized by {event.organizer}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="bg-palop-green hover:bg-palop-green/90 flex-1">
                    Register
                  </Button>
                  <Button size="sm" variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-palop-blue hover:bg-palop-blue/90 text-white px-8 py-3">
            View All Events
          </Button>
          <div className="mt-4">
            <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10">
              Submit Your Event
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityEvents;
