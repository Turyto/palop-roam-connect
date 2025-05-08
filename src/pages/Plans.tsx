
import { useState } from "react";
import { Smartphone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CtaSection from "@/components/CtaSection";

type DurationOption = "30" | "365";

const dataPackages30Days = [
  {
    id: 1,
    volume: 1,
    dent: "5,606",
    price: "3.36",
    color: "bg-palop-blue",
    countries: "Portugal + 149 More"
  },
  {
    id: 2,
    volume: 3,
    dent: "16,219",
    price: "9.73",
    color: "bg-palop-blue",
    countries: "Portugal + 149 More"
  },
  {
    id: 3,
    volume: 5,
    dent: "24,959",
    price: "14.98",
    color: "bg-palop-blue",
    countries: "Portugal + 149 More"
  },
  {
    id: 4,
    volume: 10,
    dent: "37,444",
    price: "22.47",
    color: "bg-palop-blue",
    countries: "Portugal + 149 More"
  }
];

const dataPackages365Days = [
  {
    id: 5,
    volume: 1,
    dent: "9,976",
    price: "5.99",
    color: "bg-palop-red",
    countries: "Portugal + 149 More"
  },
  {
    id: 6,
    volume: 3,
    dent: "23,710",
    price: "14.23",
    color: "bg-palop-red",
    countries: "Portugal + 149 More"
  },
  {
    id: 7,
    volume: 5,
    dent: "41,190",
    price: "24.72",
    color: "bg-palop-red",
    countries: "Portugal + 149 More"
  },
  {
    id: 8,
    volume: 10,
    dent: "62,415", 
    price: "37.45",
    color: "bg-palop-red",
    countries: "Portugal + 149 More"
  }
];

const Plans = () => {
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>("30");
  
  const dataPackages = selectedDuration === "30" ? dataPackages30Days : dataPackages365Days;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold">Choose Data Package</h1>
              <div className="mt-4 md:mt-0">
                <Select value={selectedDuration} onValueChange={(value) => setSelectedDuration(value as DurationOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="365">365 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              {dataPackages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className={`rounded-lg overflow-hidden shadow-md ${pkg.color} text-white`}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <div className="text-3xl md:text-4xl font-bold mb-1">
                          {selectedDuration} Days
                        </div>
                        <div className="text-white/90 flex items-center">
                          {pkg.countries} <span className="inline-block ml-2">›</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 md:mt-0 flex flex-col items-center bg-white/10 rounded-lg p-3">
                        <div className="flex items-center">
                          <Smartphone className="h-6 w-6 mr-2" />
                          <span className="text-sm font-semibold">Data Package</span>
                        </div>
                        <div className="text-sm opacity-80">{selectedDuration} Days Validity</div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <div className="text-5xl font-bold">{pkg.volume} <span className="text-2xl">GB</span></div>
                        <div className="uppercase text-sm font-semibold mt-1">VOLUME</div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 text-right">
                        <div className="text-sm mb-1">{pkg.dent} DENT</div>
                        <div className="bg-white text-gray-800 rounded-lg py-2 px-4">
                          <span className="text-2xl font-bold">£{pkg.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button className="bg-palop-green hover:bg-palop-green/90 text-white px-8 py-6 text-lg">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Plans;
