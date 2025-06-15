
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Signal, Globe } from "lucide-react";

const CoverageMap = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Network Coverage Overview</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our comprehensive network spans across all PALOP countries with strategic partnerships ensuring seamless connectivity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palop-green/20 flex items-center justify-center">
                <Signal className="h-8 w-8 text-palop-green" />
              </div>
              <CardTitle>94% Average Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Across all PALOP countries with focus on urban centers and transportation corridors.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palop-blue/20 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-palop-blue" />
              </div>
              <CardTitle>12+ Network Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Strategic partnerships with leading telecommunications providers in each country.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palop-yellow/20 flex items-center justify-center">
                <Globe className="h-8 w-8 text-palop-green" />
              </div>
              <CardTitle>5 Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Complete PALOP coverage from Angola to São Tomé and Príncipe.</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-gradient-to-r from-palop-green/10 to-palop-blue/10 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Stay Connected?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Choose from our flexible plans designed specifically for travel within PALOP countries. 
            Get instant activation and seamless roaming across all networks.
          </p>
          <Button className="bg-palop-green hover:bg-palop-green/90 text-white">
            View All Plans
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoverageMap;
