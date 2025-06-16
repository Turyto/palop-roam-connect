
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const ESimFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is the difference between eSIM and traditional SIM?",
      answer: "eSIM is a digital SIM that's built into your device, while traditional SIM is a physical card. eSIM allows instant activation without needing to physically insert or swap cards. You can have multiple eSIM profiles on one device and switch between them in settings."
    },
    {
      question: "How quickly can I activate my PALOP eSIM?",
      answer: "Your eSIM can be activated in under 2 minutes! After purchase, you'll receive a QR code via email instantly. Simply scan the code in your device settings, and your eSIM will be downloaded and activated automatically."
    },
    {
      question: "Can I use eSIM alongside my regular SIM card?",
      answer: "Yes! Most eSIM-compatible devices support dual SIM functionality, allowing you to use your home SIM and PALOP eSIM simultaneously. You can choose which line to use for calls, texts, and data, or set one as primary and one as secondary."
    },
    {
      question: "Which PALOP countries are covered by your eSIM?",
      answer: "Our eSIM provides coverage across all 5 PALOP countries: Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe. You can roam freely between these countries with the same plan."
    },
    {
      question: "What happens if I lose my phone with the eSIM?",
      answer: "Unlike physical SIM cards, eSIM profiles are tied to your device. If you lose your phone, contact our support team immediately. We can deactivate the eSIM and provide you with a new QR code for your replacement device at no extra cost."
    },
    {
      question: "How do I know if my device supports eSIM?",
      answer: "Check your device settings for 'Add Cellular Plan' or 'Add eSIM' option under Cellular/Mobile Data settings. Most recent smartphones from Apple (iPhone XS+), Samsung (Galaxy S20+), Google (Pixel 3+), and other major brands support eSIM."
    },
    {
      question: "Can I share my eSIM with family members?",
      answer: "No, each eSIM is tied to a specific device and cannot be shared. However, we offer family plans and group discounts for multiple eSIM purchases. Each family member will need their own eSIM activation."
    },
    {
      question: "What if I need to switch to a new device?",
      answer: "You can transfer your eSIM to a new device, but the process varies by device manufacturer. Contact our support team for step-by-step guidance, or we can provide a new QR code for easy setup on your new device."
    },
    {
      question: "Is eSIM more secure than traditional SIM?",
      answer: "Yes, eSIM is generally more secure. The profile is encrypted and embedded in your device's secure element. There's no physical card that can be stolen or cloned, and remote management allows for better security protocols."
    },
    {
      question: "Can I top up or extend my eSIM plan?",
      answer: "Absolutely! You can easily top up your data or extend your plan duration through our website or mobile app. Additional data packages can be added instantly without needing a new QR code."
    },
    {
      question: "What should I do if my eSIM isn't working?",
      answer: "First, ensure your device is unlocked and connected to Wi-Fi during setup. Check that you've selected the correct data plan in your settings. If issues persist, our 24/7 support team can help troubleshoot and resolve any connectivity problems."
    },
    {
      question: "Do I need to remove my eSIM when returning home?",
      answer: "No, you can keep your PALOP eSIM installed and simply switch back to your home carrier's line in your device settings. The eSIM profile remains dormant until you activate it again for your next trip."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            eSIM Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Get answers to common questions about eSIM technology and our PALOP connectivity solutions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-palop-green flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-palop-green flex-shrink-0" />
                    )}
                  </button>
                  
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-700 mb-6">
              Our customer support team is available 24/7 to help you with any eSIM-related questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-palop-green hover:bg-palop-green/90 text-white px-8 py-3 rounded-md font-medium transition-colors">
                Contact Support
              </button>
              <button className="border border-palop-green text-palop-green hover:bg-palop-green/10 px-8 py-3 rounded-md font-medium transition-colors">
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ESimFAQ;
