
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Mail, QrCode, Wifi, CheckCircle } from "lucide-react";

const ESimFlow = () => {
  const steps = [
    {
      icon: ShoppingCart,
      title: "Choose Your Plan",
      description: "Select the perfect data plan for your PALOP travel needs",
      color: "palop-green",
      details: [
        "Browse our PALOP-specific plans",
        "Compare data allowances and prices",
        "Select coverage countries",
        "Add to cart and checkout securely"
      ]
    },
    {
      icon: Mail,
      title: "Receive eSIM",
      description: "Get your eSIM QR code delivered instantly to your email",
      color: "palop-blue",
      details: [
        "Instant email delivery after payment",
        "QR code for eSIM activation",
        "Installation instructions included",
        "Customer support contact information"
      ]
    },
    {
      icon: QrCode,
      title: "Install eSIM",
      description: "Scan the QR code to download your eSIM profile",
      color: "palop-yellow",
      details: [
        "Open device eSIM settings",
        "Scan the provided QR code",
        "eSIM profile downloads automatically",
        "Set as primary or secondary line"
      ]
    },
    {
      icon: Wifi,
      title: "Connect Instantly",
      description: "Your eSIM activates and you're connected to PALOP networks",
      color: "palop-red",
      details: [
        "Automatic network connection",
        "Data plan becomes active",
        "Start using data immediately",
        "Roam freely across PALOP countries"
      ]
    },
    {
      icon: CheckCircle,
      title: "Stay Connected",
      description: "Enjoy seamless connectivity throughout your journey",
      color: "palop-green",
      details: [
        "Monitor data usage in real-time",
        "Top up or extend plan if needed",
        "24/7 customer support available",
        "Keep your home SIM active simultaneously"
      ]
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your eSIM Journey: From Order to Connection
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Experience the seamless process of getting connected with PALOP eSIM - 
            from purchase to activation in just minutes.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={index} className="relative">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Step Number & Icon */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-16 h-16 bg-${step.color} rounded-full flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`w-8 h-8 bg-${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-lg shadow-sm p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-700 mb-6">
                      {step.description}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 bg-${step.color} rounded-full mt-2 flex-shrink-0`}></div>
                          <p className="text-gray-600 text-sm">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="hidden md:block absolute left-8 top-24 w-px h-16 bg-gray-300"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Connected?
            </h3>
            <p className="text-gray-700 mb-6">
              Join thousands of PALOP travelers who trust our eSIM solutions for seamless connectivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-palop-green hover:bg-palop-green/90 text-white" asChild>
                <Link to="/plans">Choose Your Plan</Link>
              </Button>
              <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10" asChild>
                <Link to="/support">Need Help?</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ESimFlow;
