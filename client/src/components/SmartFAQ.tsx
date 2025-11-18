
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Search, Clock, Star, Users } from "lucide-react";
import { useState, useMemo } from "react";

const faqs = [
  {
    id: 1,
    question: "How do I activate my PALOP eSIM?",
    answer: "Activation is simple! After purchase, you'll receive a QR code via email. Simply scan the QR code with your phone's camera, follow the setup instructions, and you'll be connected within minutes.",
    category: "Activation",
    popularity: 95,
    helpfulVotes: 234
  },
  {
    id: 2,
    question: "Which countries are covered by PALOP roaming?",
    answer: "Our PALOP roaming covers all Portuguese-speaking African countries: Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe.",
    category: "Coverage",
    popularity: 88,
    helpfulVotes: 189
  },
  {
    id: 3,
    question: "What's the difference between the plan tiers?",
    answer: "Lite (1-2GB, 7 days) is perfect for tourists, Core (3-5GB, 30 days) is ideal for diaspora returnees, Plus (10GB, 30 days) is built for business travelers, NGO Pack offers multi-SIM solutions, and Local CPLP provides domestic travel options.",
    category: "Plans",
    popularity: 92,
    helpfulVotes: 276
  },
  {
    id: 4,
    question: "Can I use my plan in multiple countries?",
    answer: "Yes! All our plans work seamlessly across all PALOP countries. You can travel from Angola to Cape Verde using the same plan without any additional charges.",
    category: "Coverage",
    popularity: 85,
    helpfulVotes: 156
  },
  {
    id: 5,
    question: "How do I check my data usage?",
    answer: "You can monitor your data usage through your phone's settings or by dialing the network-specific USSD codes provided in your welcome SMS.",
    category: "Usage",
    popularity: 78,
    helpfulVotes: 143
  },
  {
    id: 6,
    question: "What happens if I run out of data?",
    answer: "You can purchase additional data packages through our online portal or by visiting partner network stores in any PALOP country.",
    category: "Usage",
    popularity: 82,
    helpfulVotes: 167
  },
  {
    id: 7,
    question: "Is customer support available 24/7?",
    answer: "Our support team is available Monday to Friday, 9 AM to 6 PM (GMT). For urgent issues, you can contact our partner networks directly in each country.",
    category: "Support",
    popularity: 75,
    helpfulVotes: 128
  },
  {
    id: 8,
    question: "Can I gift a plan to someone in the diaspora?",
    answer: "Yes! Our Core plan specifically includes diaspora gifting features. You can purchase and send plans to family and friends in PALOP countries.",
    category: "Plans",
    popularity: 70,
    helpfulVotes: 112
  },
  {
    id: 9,
    question: "Do you support eSIM on all phone models?",
    answer: "eSIM is supported on most modern smartphones including iPhone XS and newer, Google Pixel 3 and newer, and many Samsung Galaxy models. Check our compatibility list for your specific device.",
    category: "Technical",
    popularity: 65,
    helpfulVotes: 98
  },
  {
    id: 10,
    question: "How fast is the internet speed?",
    answer: "Speeds vary by location and network partner, but you can expect 4G speeds up to 50 Mbps in major cities, with 5G available in select locations across PALOP countries.",
    category: "Technical",
    popularity: 73,
    helpfulVotes: 134
  }
];

const categories = ["All", "Activation", "Coverage", "Plans", "Usage", "Support", "Technical"];

const SmartFAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = useMemo(() => {
    let filtered = faqs;
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => b.popularity - a.popularity);
  }, [searchTerm, selectedCategory]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about PALOP roaming plans and services.
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-palop-green hover:bg-palop-green/90" : ""}
              >
                {category}
                {category !== "All" && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {faqs.filter(faq => faq.category === category).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFaqs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
              </CardContent>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Card key={faq.id} className="card-hover">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleItem(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{faq.popularity}% helpful</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{faq.helpfulVotes} votes</span>
                        </div>
                      </div>
                    </div>
                    {openItems.includes(faq.id) ? (
                      <Minus className="h-5 w-5 text-palop-green flex-shrink-0" />
                    ) : (
                      <Plus className="h-5 w-5 text-palop-green flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                {openItems.includes(faq.id) && (
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{faq.answer}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">Was this helpful?</div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            👍 Yes
                          </Button>
                          <Button variant="outline" size="sm">
                            👎 No
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <Button className="bg-palop-green hover:bg-palop-green/90">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SmartFAQ;
