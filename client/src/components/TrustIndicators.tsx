
import { Shield, Users, Globe, Award, Zap, Heart } from "lucide-react";

const TrustIndicators = () => {
  const indicators = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Reliable",
      description: "Bank-grade security with 99.9% uptime guarantee",
      stat: "99.9%"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Trusted by Thousands",
      description: "Over 10,000 travelers across PALOP countries",
      stat: "10K+"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Wide Coverage",
      description: "Full coverage across all 5 PALOP nations",
      stat: "5 Countries"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Award Winning",
      description: "Best connectivity solution for African diaspora",
      stat: "#1 Rated"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "5G speeds available in major cities",
      stat: "5G Ready"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Community Driven",
      description: "Built by and for the PALOP community",
      stat: "100% PALOP"
    }
  ];

  const partnerships = [
    "Cabo Verde Telecom",
    "Angola Telecom", 
    "Tmcel Mozambique",
    "Orange Guinea-Bissau",
    "CST São Tomé"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PalopRoam?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trusted by thousands of travelers, backed by reliable partnerships
          </p>
        </div>

        {/* Trust indicators grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {indicators.map((indicator, index) => (
            <div key={index} className="text-center p-6 rounded-lg border border-gray-100 hover:border-palop-green/30 transition-colors">
              <div className="flex items-center justify-center w-16 h-16 bg-palop-green/10 rounded-full mx-auto mb-4">
                <div className="text-palop-green">
                  {indicator.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-palop-green mb-2">{indicator.stat}</div>
              <h3 className="font-semibold mb-2">{indicator.title}</h3>
              <p className="text-sm text-gray-600">{indicator.description}</p>
            </div>
          ))}
        </div>

        {/* Partnership logos */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-center mb-8">Trusted Network Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {partnerships.map((partner, index) => (
              <div key={index} className="bg-white px-6 py-3 rounded-lg shadow-sm border">
                <span className="text-gray-700 font-medium">{partner}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Official partnerships ensure reliable connectivity across all PALOP countries
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
