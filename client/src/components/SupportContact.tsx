
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";

const SupportContact = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Need personalized assistance? Our support team is ready to help you with any questions or issues.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center card-hover">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palop-green/20 flex items-center justify-center">
                <Mail className="h-8 w-8 text-palop-green" />
              </div>
              <CardTitle className="text-lg">Email Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">support@paloproam.com</p>
              <p className="text-sm text-gray-500">Response within 24 hours</p>
            </CardContent>
          </Card>
          
          <Card className="text-center card-hover">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palop-blue/20 flex items-center justify-center">
                <Phone className="h-8 w-8 text-palop-blue" />
              </div>
              <CardTitle className="text-lg">Phone Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">+351 XXX XXX XXX</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM GMT</p>
            </CardContent>
          </Card>
          
          <Card className="text-center card-hover">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palop-yellow/20 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-palop-green" />
              </div>
              <CardTitle className="text-lg">Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Available on website</p>
              <p className="text-sm text-gray-500">Real-time assistance</p>
            </CardContent>
          </Card>
          
          <Card className="text-center card-hover">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palop-red/20 flex items-center justify-center">
                <Clock className="h-8 w-8 text-palop-green" />
              </div>
              <CardTitle className="text-lg">Emergency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">24/7 Emergency Line</p>
              <p className="text-sm text-gray-500">Critical issues only</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-gradient-to-r from-palop-green/10 to-palop-blue/10 rounded-lg p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
            <p className="text-gray-600 mb-6">
              For urgent technical issues while traveling, contact our partner networks directly in each country:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>Angola:</strong> Unitel Customer Care</p>
                <p><strong>Cape Verde:</strong> CVMóvel Support</p>
                <p><strong>Guinea-Bissau:</strong> MTN Customer Service</p>
              </div>
              <div className="space-y-2">
                <p><strong>Mozambique:</strong> Vodacom Care Center</p>
                <p><strong>São Tomé:</strong> CST Customer Support</p>
              </div>
            </div>
            <Button className="mt-6 bg-palop-green hover:bg-palop-green/90">
              View Emergency Contacts
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportContact;
