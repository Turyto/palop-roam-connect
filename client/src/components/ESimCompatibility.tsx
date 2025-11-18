
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Watch, Laptop, Check, AlertCircle } from "lucide-react";

const ESimCompatibility = () => {
  const deviceBrands = [
    {
      brand: "Apple",
      icon: "🍎",
      devices: [
        "iPhone XS, XS Max, XR and later",
        "iPad Pro (3rd gen) and later",
        "iPad Air (3rd gen) and later",
        "iPad mini (5th gen) and later",
        "Apple Watch Series 3 and later"
      ]
    },
    {
      brand: "Samsung",
      icon: "📱",
      devices: [
        "Galaxy S20 series and later",
        "Galaxy Note 20 series and later",
        "Galaxy Z Fold/Flip series",
        "Galaxy Tab S6 and later",
        "Galaxy Watch 4 and later"
      ]
    },
    {
      brand: "Google",
      icon: "🔍",
      devices: [
        "Pixel 3, 3 XL and later",
        "Pixel 4a, 5, 6 series",
        "Pixel 7, 8 series",
        "Pixel Fold",
        "Pixel Watch"
      ]
    },
    {
      brand: "Other Brands",
      icon: "📲",
      devices: [
        "Huawei P40 series and later",
        "OnePlus 7T and later",
        "Xiaomi Mi 10 and later",
        "Oppo Find X3 and later",
        "Motorola Razr (2019) and later"
      ]
    }
  ];

  const checkSteps = [
    {
      icon: Smartphone,
      title: "Check Device Settings",
      description: "Go to Settings > Cellular/Mobile Data",
      detail: "Look for 'Add Cellular Plan' or 'Add eSIM' option"
    },
    {
      icon: AlertCircle,
      title: "Verify eSIM Support",
      description: "Confirm your device supports eSIM",
      detail: "Check our compatibility list or contact support"
    },
    {
      icon: Check,
      title: "Ensure Network Unlock",
      description: "Your device must be unlocked",
      detail: "Contact your carrier if you're unsure about unlock status"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            eSIM Device Compatibility
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Make sure your device supports eSIM technology before purchasing your PALOP eSIM plan.
          </p>
        </div>

        {/* Quick Check Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {checkSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-palop-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-palop-green" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-2">{step.description}</p>
                  <p className="text-sm text-gray-600">{step.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Device Compatibility List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {deviceBrands.map((brand, index) => (
            <Card key={index} className="card-hover">
              <CardHeader>
                <div className="text-center">
                  <div className="text-4xl mb-2">{brand.icon}</div>
                  <CardTitle className="text-xl">{brand.brand}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {brand.devices.map((device, deviceIndex) => (
                    <li key={deviceIndex} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-palop-green mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{device}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compatibility Check Tool */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <Smartphone className="h-12 w-12 text-palop-green mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Not Sure About Your Device?
            </h3>
            <p className="text-gray-700">
              We can help you check if your device supports eSIM technology.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-palop-green/10 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Quick Check Method:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Go to Settings on your device</li>
                <li>Navigate to Cellular/Mobile Data settings</li>
                <li>Look for "Add Cellular Plan" or "Add eSIM" option</li>
                <li>If you see this option, your device supports eSIM!</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-palop-green hover:bg-palop-green/90 text-white">
                Contact Support
              </Button>
              <Button variant="outline" className="flex-1 border-palop-green text-palop-green hover:bg-palop-green/10">
                View Full Compatibility List
              </Button>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Your device must be unlocked to use our eSIM plans</li>
                <li>• Some older devices may support eSIM but have limited functionality</li>
                <li>• Dual SIM functionality varies by device and carrier</li>
                <li>• Contact us if you're unsure about your device's compatibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ESimCompatibility;
