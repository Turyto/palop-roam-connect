
import { Card, CardContent } from "@/components/ui/card";

const countries = [
  {
    id: 1,
    name: "Angola",
    flag: "🇦🇴",
    coverage: "98%",
    partners: ["Unitel", "Movicel"]
  },
  {
    id: 2,
    name: "Cape Verde",
    flag: "🇨🇻",
    coverage: "95%",
    partners: ["CVMóvel", "Unitel T+"]
  },
  {
    id: 3,
    name: "Guinea-Bissau",
    flag: "🇬🇼",
    coverage: "90%",
    partners: ["MTN", "Orange"]
  },
  {
    id: 4,
    name: "Mozambique",
    flag: "🇲🇿",
    coverage: "94%",
    partners: ["Vodacom", "mCel"]
  },
  {
    id: 5,
    name: "São Tomé and Príncipe",
    flag: "🇸🇹",
    coverage: "92%",
    partners: ["CST", "Unitel STP"]
  }
];

const CountriesSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">PALOP Coverage</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our roaming plans provide reliable coverage throughout all PALOP countries through our partnerships with leading local carriers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country) => (
            <Card key={country.id} className="card-hover overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-palop-green via-palop-yellow to-palop-red"></div>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">{country.flag}</span>
                  <div>
                    <h3 className="font-bold text-xl">{country.name}</h3>
                    <p className="text-sm text-gray-500">Coverage: {country.coverage}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Partner Networks:</p>
                  <div className="flex flex-wrap gap-2">
                    {country.partners.map((partner, index) => (
                      <span 
                        key={index} 
                        className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs"
                      >
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountriesSection;
