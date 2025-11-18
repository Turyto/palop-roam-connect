
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "How do I activate my PALOP eSIM?",
    answer: "Activation is simple! After purchase, you'll receive a QR code via email. Simply scan the QR code with your phone's camera, follow the setup instructions, and you'll be connected within minutes."
  },
  {
    id: 2,
    question: "Which countries are covered by PALOP roaming?",
    answer: "Our PALOP roaming covers all Portuguese-speaking African countries: Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe."
  },
  {
    id: 3,
    question: "What's the difference between the plan tiers?",
    answer: "Lite (1-2GB, 7 days) is perfect for tourists, Core (3-5GB, 30 days) is ideal for diaspora returnees, Plus (10GB, 30 days) is built for business travelers, NGO Pack offers multi-SIM solutions, and Local CPLP provides domestic travel options."
  },
  {
    id: 4,
    question: "Can I use my plan in multiple countries?",
    answer: "Yes! All our plans work seamlessly across all PALOP countries. You can travel from Angola to Cape Verde using the same plan without any additional charges."
  },
  {
    id: 5,
    question: "How do I check my data usage?",
    answer: "You can monitor your data usage through your phone's settings or by dialing the network-specific USSD codes provided in your welcome SMS."
  },
  {
    id: 6,
    question: "What happens if I run out of data?",
    answer: "You can purchase additional data packages through our online portal or by visiting partner network stores in any PALOP country."
  },
  {
    id: 7,
    question: "Is customer support available 24/7?",
    answer: "Our support team is available Monday to Friday, 9 AM to 6 PM (GMT). For urgent issues, you can contact our partner networks directly in each country."
  },
  {
    id: 8,
    question: "Can I gift a plan to someone in the diaspora?",
    answer: "Yes! Our Core plan specifically includes diaspora gifting features. You can purchase and send plans to family and friends in PALOP countries."
  }
];

const SupportFAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

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
        
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id} className="card-hover">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleItem(faq.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  {openItems.includes(faq.id) ? (
                    <Minus className="h-5 w-5 text-palop-green" />
                  ) : (
                    <Plus className="h-5 w-5 text-palop-green" />
                  )}
                </div>
              </CardHeader>
              {openItems.includes(faq.id) && (
                <CardContent className="pt-0">
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
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

export default SupportFAQ;
