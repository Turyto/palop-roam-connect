
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Sim, Shield, Clock } from "lucide-react";

const ESimTechnology = () => {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What is eSIM Technology?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            eSIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan 
            without using a physical nano-SIM card.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Traditional SIM vs eSIM</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sim className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Traditional SIM</h4>
                  <p className="text-gray-600">Physical plastic card that you insert into your device</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-palop-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Smartphone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">eSIM</h4>
                  <p className="text-gray-600">Digital SIM built into your device - activated remotely</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-palop-green/10 to-palop-blue/10 rounded-lg p-8">
            <div className="space-y-6">
              <div className="text-center">
                <Smartphone className="h-24 w-24 text-palop-green mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900">Your Device</h4>
                <p className="text-sm text-gray-600">eSIM chip built-in</p>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-16 h-px bg-palop-green"></div>
                <div className="mx-4 text-palop-green text-sm font-medium">Download</div>
                <div className="w-16 h-px bg-palop-green"></div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-gray-900 rounded"></div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">QR Code</h4>
                <p className="text-sm text-gray-600">Scan to activate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-8 w-8 text-palop-green mx-auto mb-2" />
              <CardTitle className="text-lg">Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Built-in security with encrypted activation</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-8 w-8 text-palop-blue mx-auto mb-2" />
              <CardTitle className="text-lg">Instant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Activate your plan in under 2 minutes</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Smartphone className="h-8 w-8 text-palop-yellow mx-auto mb-2" />
              <CardTitle className="text-lg">Flexible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Switch between multiple carriers easily</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Sim className="h-8 w-8 text-palop-red mx-auto mb-2" />
              <CardTitle className="text-lg">Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No physical damage or loss possible</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ESimTechnology;
