
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-6 animate-slide-from-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Stay Connected Across <span className="gradient-text">PALOP</span> Communities
          </h1>
          <p className="text-lg text-gray-700 max-w-lg">
            Affordable data and voice roaming plans designed specifically for travelers and communities from Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button className="bg-palop-green hover:bg-palop-green/90 text-white" asChild>
              <Link to="/plans">View Plans</Link>
            </Button>
            <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10" asChild>
              <Link to="/community">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0 animate-slide-from-right">
          <div className="relative">
            <div className="bg-gradient-to-br from-palop-green/20 to-palop-blue/20 rounded-full w-72 h-72 md:w-96 md:h-96 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-64 md:w-80">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-4 h-4 rounded-full bg-palop-green"></div>
                <div className="w-4 h-4 rounded-full bg-palop-yellow"></div>
                <div className="w-4 h-4 rounded-full bg-palop-red"></div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-24 bg-gray-200 rounded-md"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-palop-green rounded-md w-1/3"></div>
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

export default HeroSection;
