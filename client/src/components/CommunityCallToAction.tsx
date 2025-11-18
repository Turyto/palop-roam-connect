
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Smartphone, Heart } from "lucide-react";

const CommunityCallToAction = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-palop-blue to-palop-green text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the PALOP Roam Connect Movement
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Together, we're building more than just a network – we're creating a community that bridges distances, 
            celebrates culture, and empowers every member of the PALOP diaspora.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-palop-yellow" />
              <h3 className="text-xl font-semibold mb-3">Connect with Community</h3>
              <p className="opacity-90">
                Discover events, meet fellow PALOP community members, and strengthen cultural bonds.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors">
            <CardContent className="p-6 text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-palop-yellow" />
              <h3 className="text-xl font-semibold mb-3">Stay Connected</h3>
              <p className="opacity-90">
                Get affordable eSIM plans that keep you connected to home and your travels across PALOP countries.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors">
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-palop-yellow" />
              <h3 className="text-xl font-semibold mb-3">Support Local</h3>
              <p className="opacity-90">
                Support PALOP-owned businesses and help strengthen our economic network in the diaspora.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button className="bg-palop-yellow text-palop-dark hover:bg-palop-yellow/90 font-semibold px-8 py-3" asChild>
            <Link to="/plans">Get Your eSIM Now</Link>
          </Button>
          <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-palop-blue font-semibold px-8 py-3">
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityCallToAction;
