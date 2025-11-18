
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Globe, Users, MapPin, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const EnhancedHeroSection = () => {
  const [stats, setStats] = useState({
    activeUsers: 12847,
    countriesConnected: 5,
    dataTransferred: 2.4,
    connectionsMade: 8392
  });

  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "5 Countries United",
      description: "Seamless connectivity across all PALOP nations"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "12K+ Connected",
      description: "Growing community of travelers and diaspora"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Real-Time Coverage",
      description: "Live network status and optimal routing"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Activation",
      description: "Get connected in under 2 minutes"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
        countriesConnected: 5,
        dataTransferred: prev.dataTransferred + Math.random() * 0.1,
        connectionsMade: prev.connectionsMade + Math.floor(Math.random() * 2)
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-palop-green/5">
      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-8 animate-slide-from-left">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-palop-green/10 rounded-full text-palop-green text-sm font-medium">
              <Zap className="h-4 w-4 mr-2" />
              Live: {stats.activeUsers.toLocaleString()} users connected
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Stay Connected Across <span className="gradient-text">PALOP</span> Communities
            </h1>
            
            <p className="text-lg text-gray-700 max-w-lg">
              Affordable data and voice roaming plans designed specifically for travelers and communities from Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe.
            </p>
          </div>

          {/* Dynamic Feature Showcase */}
          <div className="bg-white rounded-lg shadow-sm border p-6 transition-all duration-500">
            <div className="flex items-center mb-3">
              <div className="text-palop-green mr-3">
                {features[currentFeature].icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{features[currentFeature].title}</h3>
                <p className="text-sm text-gray-600">{features[currentFeature].description}</p>
              </div>
            </div>
            <div className="flex space-x-1 mt-4">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    index === currentFeature ? 'bg-palop-green' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button className="bg-palop-green hover:bg-palop-green/90 text-white px-8 py-3" asChild>
              <Link to="/plans">View Plans</Link>
            </Button>
            <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10 px-8 py-3" asChild>
              <Link to="/community">Join Community</Link>
            </Button>
          </div>
        </div>

        <div className="md:w-1/2 mt-10 md:mt-0 animate-slide-from-right">
          <div className="relative">
            <div className="bg-gradient-to-br from-palop-green/20 to-palop-blue/20 rounded-full w-72 h-72 md:w-96 md:h-96 mx-auto"></div>
            
            {/* Live Stats Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-64 md:w-80">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-4 h-4 rounded-full bg-palop-green animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-palop-yellow"></div>
                <div className="w-4 h-4 rounded-full bg-palop-red"></div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Data Transferred Today</div>
                  <div className="text-2xl font-bold text-palop-green">{stats.dataTransferred.toFixed(1)} TB</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Countries</div>
                    <div className="text-lg font-semibold">{stats.countriesConnected}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Connections</div>
                    <div className="text-lg font-semibold">{stats.connectionsMade.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="h-8 bg-palop-green rounded-md w-1/3 flex items-center justify-center text-white text-xs font-medium">
                    Active
                  </div>
                  <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHeroSection;
