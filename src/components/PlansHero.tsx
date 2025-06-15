
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Globe, Users, Shield, Zap } from "lucide-react";

const PlansHero = () => {
  return (
    <section className="bg-gradient-to-br from-palop-green via-palop-blue to-palop-yellow relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Connect Across <span className="text-palop-yellow">PALOP</span> Nations
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            From Cape Verde's beaches to Mozambique's coastlines, stay connected 
            with plans designed for the PALOP community
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Globe className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm opacity-80">PALOP Countries</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm opacity-80">Connected Users</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm opacity-80">Network Uptime</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold">5G</div>
              <div className="text-sm opacity-80">Speed Available</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-white text-palop-green hover:bg-white/90" size="lg" asChild>
              <Link to="#plans">Explore Plans</Link>
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" asChild>
              <Link to="/community">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlansHero;
