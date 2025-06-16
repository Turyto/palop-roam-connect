
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Smartphone, Wifi, Globe, Zap } from "lucide-react";

const ESimHero = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-palop-green/5">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-palop-green/10 rounded-full text-palop-green text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Next-Generation Connectivity
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Understanding <span className="gradient-text">eSIM</span> Technology
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Discover how eSIM revolutionizes mobile connectivity for PALOP communities. 
            Learn everything about our digital SIM technology, from purchase to activation.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button className="bg-palop-green hover:bg-palop-green/90 text-white px-8 py-3" asChild>
              <Link to="/plans">Get Your eSIM</Link>
            </Button>
            <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10 px-8 py-3">
              <a href="#how-it-works">Learn How It Works</a>
            </Button>
          </div>

          {/* Visual Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-palop-green/10 rounded-full flex items-center justify-center mb-3">
                <Smartphone className="h-8 w-8 text-palop-green" />
              </div>
              <h3 className="font-semibold text-gray-900">Digital SIM</h3>
              <p className="text-sm text-gray-600">No physical card needed</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-palop-blue/10 rounded-full flex items-center justify-center mb-3">
                <Wifi className="h-8 w-8 text-palop-blue" />
              </div>
              <h3 className="font-semibold text-gray-900">Instant Activation</h3>
              <p className="text-sm text-gray-600">Active in minutes</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-palop-yellow/10 rounded-full flex items-center justify-center mb-3">
                <Globe className="h-8 w-8 text-palop-yellow" />
              </div>
              <h3 className="font-semibold text-gray-900">Global Coverage</h3>
              <p className="text-sm text-gray-600">5 PALOP countries</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-palop-red/10 rounded-full flex items-center justify-center mb-3">
                <Zap className="h-8 w-8 text-palop-red" />
              </div>
              <h3 className="font-semibold text-gray-900">Easy Setup</h3>
              <p className="text-sm text-gray-600">Scan QR code & go</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESimHero;
