
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MessageCircle, Clock, MapPin, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";

const EnhancedSupportContact = () => {
  const [supportMetrics] = useState({
    avgResponseTime: "2.3 hours",
    satisfactionRate: "98%",
    activeAgents: 12,
    ticketsResolved: 1847
  });

  const emergencyContacts = [
    { country: "Angola", operator: "Unitel", number: "+244 923 000 000", status: "online" },
    { country: "Cape Verde", operator: "CVMóvel", number: "+238 991 1234", status: "online" },
    { country: "Guinea-Bissau", operator: "MTN", number: "+245 955 0000", status: "online" },
    { country: "Mozambique", operator: "Vodacom", number: "+258 84 300 0000", status: "online" },
    { country: "São Tomé", operator: "CST", number: "+239 990 1234", status: "offline" }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Need personalized assistance? Our support team is ready to help you with any questions or issues.
          </p>
        </div>
        
        {/* Support Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-palop-green">{supportMetrics.avgResponseTime}</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-palop-green">{supportMetrics.satisfactionRate}</div>
            <div className="text-sm text-gray-600">Satisfaction</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-palop-green">{supportMetrics.activeAgents}</div>
            <div className="text-sm text-gray-600">Active Agents</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-palop-green">{supportMetrics.ticketsResolved}</div>
            <div className="text-sm text-gray-600">Tickets Resolved</div>
          </div>
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
              <a href="mailto:suporte@palopconnect.com" className="text-gray-600 hover:text-palop-green mb-4 block">suporte@palopconnect.com</a>
              <p className="text-sm text-gray-500 mb-3">Response within 24 hours</p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Available
              </Badge>
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
              <p className="text-sm text-gray-500 mb-3">Mon-Fri, 9 AM - 6 PM GMT</p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
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
              <p className="text-sm text-gray-500 mb-3">Real-time assistance</p>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Users className="h-3 w-3 mr-1" />
                {supportMetrics.activeAgents} agents online
              </Badge>
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
              <p className="text-sm text-gray-500 mb-3">Critical issues only</p>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Emergency Only
              </Badge>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Emergency Contacts */}
        <div className="bg-gradient-to-r from-palop-green/10 to-palop-blue/10 rounded-lg p-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Partner Network Emergency Contacts</h3>
            <p className="text-gray-600 mb-8 text-center">
              For urgent technical issues while traveling, contact our partner networks directly:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {emergencyContacts.map((contact, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{contact.country}</h4>
                      <p className="text-sm text-gray-600">{contact.operator}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        contact.status === 'online' 
                          ? 'text-green-600 border-green-600' 
                          : 'text-gray-600 border-gray-600'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        contact.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      {contact.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-mono">{contact.number}</span>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <Button className="bg-palop-green hover:bg-palop-green/90">
                <MapPin className="h-4 w-4 mr-2" />
                View All Emergency Contacts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedSupportContact;
