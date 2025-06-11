
import { Button } from "@/components/ui/button";
import { Heart, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const CommunityHero = () => {
  return (
    <section className="bg-gradient-to-r from-palop-green to-palop-blue text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Connecting the <span className="text-palop-yellow">PALOP</span> Community
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
          Bridging cultures, fostering connections, and empowering our diaspora through technology and partnerships across borders.
        </p>
        
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
            <Link to="#partners">Discover Partners</Link>
          </Button>
          <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-palop-blue font-semibold px-8 py-3" asChild>
            <Link to="/plans">Join Our Network</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityHero;
