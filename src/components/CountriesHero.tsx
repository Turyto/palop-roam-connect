
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Globe, Users, Shield, Zap, MapPin, TrendingUp, Wifi, Activity } from "lucide-react";

const CountriesHero = () => {
  const [selectedCountry, setSelectedCountry] = useState("angola");

  const countries = [
    { id: "angola", name: "Angola", flag: "🇦🇴", users: "12K+", coverage: "98%" },
    { id: "cape-verde", name: "Cape Verde", flag: "🇨🇻", users: "8K+", coverage: "95%" },
    { id: "guinea-bissau", name: "Guinea-Bissau", flag: "🇬🇼", users: "3K+", coverage: "90%" },
    { id: "mozambique", name: "Mozambique", flag: "🇲🇿", users: "15K+", coverage: "94%" },
    { id: "sao-tome", name: "São Tomé & Príncipe", flag: "🇸🇹", users: "2K+", coverage: "92%" }
  ];

  const stats = [
    {
      icon: <Globe className="h-6 w-6" />,
      value: "5",
      label: "PALOP Countries",
      color: "bg-palop-green"
    },
    {
      icon: <Users className="h-6 w-6" />,
      value: "40K+",
      label: "Connected Users",
      color: "bg-palop-blue"
    },
    {
      icon: <Wifi className="h-6 w-6" />,
      value: "94%",
      label: "Average Coverage",
      color: "bg-palop-yellow"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      value: "99.2%",
      label: "Network Uptime",
      color: "bg-palop-red"
    }
  ];

  const selectedCountryData = countries.find(c => c.id === selectedCountry);

  return (
    <section className="bg-gradient-to-br from-palop-green via-palop-blue to-palop-yellow relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Discover <span className="text-palop-yellow">PALOP</span> Connectivity
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
            Comprehensive coverage across Portuguese-speaking African nations. 
            Explore detailed insights, cultural connections, and seamless roaming solutions.
          </p>
        </div>

        {/* Interactive Country Selector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-12 max-w-4xl mx-auto">
          <h3 className="text-white text-lg font-semibold mb-4 text-center">Explore by Country</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country.id)}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  selectedCountry === country.id
                    ? 'bg-white text-palop-green scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <div className="text-2xl mb-1">{country.flag}</div>
                <div className="text-xs font-medium">{country.name}</div>
              </button>
            ))}
          </div>
          
          {selectedCountryData && (
            <div className="text-center text-white">
              <div className="flex justify-center space-x-8 text-sm">
                <div>
                  <div className="text-palop-yellow font-bold text-lg">{selectedCountryData.users}</div>
                  <div className="opacity-80">Connected Users</div>
                </div>
                <div>
                  <div className="text-palop-yellow font-bold text-lg">{selectedCountryData.coverage}</div>
                  <div className="opacity-80">Network Coverage</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse`}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button className="bg-white text-palop-green hover:bg-white/90" size="lg" asChild>
            <Link to="#countries-grid">Explore Countries</Link>
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" asChild>
            <Link to="#coverage-map">View Coverage Map</Link>
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" asChild>
            <Link to="/plans">Compare Plans</Link>
          </Button>
        </div>

        {/* Connectivity Status Indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-palop-green rounded-full animate-pulse"></div>
            <span className="text-white text-sm">All networks operational • Last updated: 2 minutes ago</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountriesHero;
