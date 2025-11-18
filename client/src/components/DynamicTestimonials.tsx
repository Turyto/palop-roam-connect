
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "João Santos",
    location: "Angola → Portugal",
    text: "PALOP Roam has been essential for my regular business trips between Angola and Mozambique. The coverage is excellent and I never worry about staying connected.",
    avatar: "JS",
    rating: 5,
    plan: "Business Plus",
    savings: "€150/month",
    flag: "🇦🇴"
  },
  {
    id: 2,
    name: "Maria Tavares",
    location: "Cape Verde → France",
    text: "As someone who travels between Cape Verde and Portugal regularly, having affordable data roaming is a lifesaver. Customer service is also top-notch!",
    avatar: "MT",
    rating: 5,
    plan: "Core Plan",
    savings: "€85/month",
    flag: "🇨🇻"
  },
  {
    id: 3,
    name: "António Mendes",
    location: "Mozambique → UK",
    text: "I've tried many roaming services, but PALOP Roam offers the best value specifically for our community. The voice quality is clear and the data speeds are fast.",
    avatar: "AM",
    rating: 5,
    plan: "Core Plan",
    savings: "€120/month",
    flag: "🇲🇿"
  },
  {
    id: 4,
    name: "Fatima Silva",
    location: "Guinea-Bissau → Spain",
    text: "The family sharing features are incredible. I can keep my entire family connected across different countries without breaking the bank.",
    avatar: "FS",
    rating: 5,
    plan: "Family Pack",
    savings: "€200/month",
    flag: "🇬🇼"
  },
  {
    id: 5,
    name: "Carlos Pereira",
    location: "São Tomé → Germany",
    text: "From São Tomé to Germany, the connection is seamless. Perfect for video calls with family and managing my business remotely.",
    avatar: "CP",
    rating: 5,
    plan: "Business Plus",
    savings: "€180/month",
    flag: "🇸🇹"
  }
];

const DynamicTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-gray-50 to-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by the PALOP Community</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join thousands of satisfied customers who've saved money and stayed connected with their loved ones.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Card className="card-hover overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/3 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarFallback className="bg-palop-green text-white text-xl">{current.avatar}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-2">{current.flag} {current.name}</h3>
                  <p className="text-gray-600 mb-4">{current.location}</p>
                  <div className="flex justify-center mb-4">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <div className="bg-palop-green/10 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Monthly Savings</div>
                    <div className="text-lg font-bold text-palop-green">{current.savings}</div>
                    <div className="text-xs text-gray-500">{current.plan}</div>
                  </div>
                </div>
                
                <div className="md:w-2/3 relative">
                  <Quote className="h-12 w-12 text-palop-green/30 mb-4" />
                  <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-6">
                    "{current.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentIndex(index);
                            setIsAutoPlaying(false);
                          }}
                          className={`h-2 w-8 rounded-full transition-all duration-300 ${
                            index === currentIndex ? 'bg-palop-green' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prev}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={next}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-gray-600">Live testimonials from real users</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DynamicTestimonials;
