
import { Button } from "@/components/ui/button";
import { Heart, Users, Globe, MapPin, Calendar, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const CommunityHero = () => {
  const [stats, setStats] = useState({
    members: 12500,
    connections: 45000,
    events: 150,
    countries: 25
  });

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const spotlightStories = [
    {
      name: "Maria Santos",
      location: "Lisbon, Portugal",
      story: "Connected with 200+ Cape Verdean entrepreneurs through PALOP Roam",
      flag: "🇨🇻"
    },
    {
      name: "João Mendes", 
      location: "Paris, France",
      story: "Launched successful Angolan restaurant with community support",
      flag: "🇦🇴"
    },
    {
      name: "Ana Silva",
      location: "London, UK", 
      story: "Created cultural exchange program connecting 5 PALOP countries",
      flag: "🇲🇿"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % spotlightStories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        members: prev.members + Math.floor(Math.random() * 3),
        connections: prev.connections + Math.floor(Math.random() * 5),
        events: prev.events,
        countries: prev.countries
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gradient-to-r from-palop-green via-palop-blue to-palop-green text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Connecting the <span className="text-palop-yellow">PALOP</span> Community
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Bridging cultures, fostering connections, and empowering our diaspora through technology and partnerships across borders.
          </p>
        </div>
        
        {/* Real-time Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-scale-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl md:text-3xl font-bold text-palop-yellow">{stats.members.toLocaleString()}+</div>
            <div className="text-sm opacity-90">Community Members</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl md:text-3xl font-bold text-palop-yellow">{stats.connections.toLocaleString()}+</div>
            <div className="text-sm opacity-90">Connections Made</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl md:text-3xl font-bold text-palop-yellow">{stats.events}+</div>
            <div className="text-sm opacity-90">Events Hosted</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl md:text-3xl font-bold text-palop-yellow">{stats.countries}</div>
            <div className="text-sm opacity-90">Countries United</div>
          </div>
        </div>

        {/* Community Spotlight Stories */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-3">
            <Zap className="h-5 w-5 text-palop-yellow mr-2" />
            <span className="text-sm font-semibold uppercase tracking-wide">Community Spotlight</span>
          </div>
          <div className="min-h-[80px] transition-all duration-500">
            <div className="text-lg font-semibold mb-2">
              {spotlightStories[currentStoryIndex].flag} {spotlightStories[currentStoryIndex].name}
            </div>
            <div className="text-sm opacity-90 mb-1">{spotlightStories[currentStoryIndex].location}</div>
            <div className="text-sm">{spotlightStories[currentStoryIndex].story}</div>
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            {spotlightStories.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStoryIndex ? 'bg-palop-yellow' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-palop-yellow" />
            <span className="text-lg font-semibold">Unity</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-palop-yellow" />
            <span className="text-lg font-semibold">Community</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-palop-yellow" />
            <span className="text-lg font-semibold">Connection</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button className="bg-palop-yellow text-palop-dark hover:bg-palop-yellow/90 font-semibold px-8 py-3" asChild>
            <Link to="#community-events">Join Events</Link>
          </Button>
          <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-palop-blue font-semibold px-8 py-3" asChild>
            <Link to="#partners">Discover Partners</Link>
          </Button>
          <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-palop-blue font-semibold px-8 py-3" asChild>
            <Link to="/plans">Get Connected</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityHero;
