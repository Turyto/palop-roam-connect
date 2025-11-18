
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Gift, MessageCircle, Shield, Globe, Zap, Heart, Building } from "lucide-react";
import { ESIMPlan } from "@/pages/Purchase";

interface PlanValuePropositionProps {
  plan: ESIMPlan;
}

const PlanValueProposition = ({ plan }: PlanValuePropositionProps) => {
  const getValueAddedServices = (planId: string) => {
    switch (planId) {
      case "lite":
        return [
          {
            icon: <Zap className="h-5 w-5" />,
            title: "Instant Activation",
            description: "QR code setup in under 2 minutes"
          },
          {
            icon: <Globe className="h-5 w-5" />,
            title: "Tourist Hotspots",
            description: "Optimized coverage at airports & attractions"
          },
          {
            icon: <MessageCircle className="h-5 w-5" />,
            title: "24/7 Tourist Support",
            description: "Multi-language customer assistance"
          }
        ];
      case "core":
        return [
          {
            icon: <Gift className="h-5 w-5" />,
            title: "Diaspora Gifting",
            description: "Send data to family back home"
          },
          {
            icon: <Users className="h-5 w-5" />,
            title: "Community Access",
            description: "Connect with PALOP diaspora network"
          },
          {
            icon: <MessageCircle className="h-5 w-5" />,
            title: "Welcome SMS Pack",
            description: "Local tips & community updates"
          },
          {
            icon: <Heart className="h-5 w-5" />,
            title: "Cultural Events",
            description: "Exclusive invites to PALOP community events"
          }
        ];
      case "plus":
        return [
          {
            icon: <Shield className="h-5 w-5" />,
            title: "Business Priority",
            description: "Dedicated support & faster speeds"
          },
          {
            icon: <Globe className="h-5 w-5" />,
            title: "PALOP+ Roaming",
            description: "Extended coverage across partnerships"
          },
          {
            icon: <Users className="h-5 w-5" />,
            title: "Executive Network",
            description: "Access to business networking events"
          },
          {
            icon: <Zap className="h-5 w-5" />,
            title: "Enterprise Features",
            description: "VPN support & enhanced security"
          }
        ];
      case "ngo":
        return [
          {
            icon: <Building className="h-5 w-5" />,
            title: "Multi-SIM Management",
            description: "Centralized control for field teams"
          },
          {
            icon: <Shield className="h-5 w-5" />,
            title: "Usage Analytics",
            description: "Real-time monitoring & reporting"
          },
          {
            icon: <Users className="h-5 w-5" />,
            title: "Partner Integration",
            description: "Seamless billing & procurement"
          },
          {
            icon: <Globe className="h-5 w-5" />,
            title: "Field Operations",
            description: "Optimized for remote locations"
          }
        ];
      case "local-cplp":
        return [
          {
            icon: <Globe className="h-5 w-5" />,
            title: "CPLP Roaming",
            description: "Affordable rates across Portuguese-speaking countries"
          },
          {
            icon: <Heart className="h-5 w-5" />,
            title: "Cultural Bridge",
            description: "Connect with local communities"
          },
          {
            icon: <Users className="h-5 w-5" />,
            title: "Regional Partners",
            description: "Local support in each country"
          },
          {
            icon: <Zap className="h-5 w-5" />,
            title: "Quick Activation",
            description: "Instant connectivity upon arrival"
          }
        ];
      default:
        return [];
    }
  };

  const getCommunityBenefits = (planId: string) => {
    const baseBenefits = [
      "PALOP Cultural Exchange Platform",
      "Local Business Directory Access",
      "Emergency Support Network"
    ];

    if (planId === "core") {
      return [
        ...baseBenefits,
        "Diaspora Family Connection Hub",
        "Monthly Community Newsletter",
        "Cultural Event Notifications"
      ];
    }

    if (planId === "plus") {
      return [
        ...baseBenefits,
        "Business Networking Opportunities",
        "Professional Development Webinars",
        "Investment & Trade Insights"
      ];
    }

    if (planId === "ngo") {
      return [
        ...baseBenefits,
        "NGO Partnership Network",
        "Development Project Collaboration",
        "Humanitarian Response Coordination",
        "Grant Opportunity Alerts"
      ];
    }

    if (planId === "local-cplp") {
      return [
        ...baseBenefits,
        "CPLP Cultural Events",
        "Language Exchange Programs",
        "Regional Travel Guides",
        "Local Volunteer Opportunities"
      ];
    }

    return baseBenefits;
  };

  const valueServices = getValueAddedServices(plan.id);
  const communityBenefits = getCommunityBenefits(plan.id);

  return (
    <div className="space-y-6">
      {/* Value-Added Services */}
      <Card className="border-palop-green/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-palop-green">
            What's Included with {plan.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {valueServices.map((service, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-palop-green/10 rounded-full flex items-center justify-center text-palop-green">
                  {service.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{service.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Benefits */}
      <Card className="border-palop-blue/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-palop-blue">
            Connect with the PALOP Community
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Join thousands of PALOP community members worldwide and access exclusive benefits:
          </p>
          <div className="space-y-2">
            {communityBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-palop-blue rounded-full"></div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
          
          {plan.id === "core" && (
            <Badge className="mt-4 bg-palop-green/10 text-palop-green border-palop-green/20">
              Most Popular with Diaspora Families
            </Badge>
          )}
          
          {plan.id === "ngo" && (
            <Badge className="mt-4 bg-palop-red/10 text-palop-red border-palop-red/20">
              Trusted by 200+ NGOs
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Social Proof */}
      <Card className="bg-gradient-to-r from-palop-green/5 to-palop-blue/5 border-0">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex justify-center space-x-8 mb-4">
              <div>
                <div className="text-2xl font-bold text-palop-green">15K+</div>
                <div className="text-xs text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-palop-blue">5</div>
                <div className="text-xs text-gray-600">PALOP Countries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-palop-yellow">4.8★</div>
                <div className="text-xs text-gray-600">User Rating</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 italic">
              "Finally, a reliable way to stay connected across all PALOP countries. 
              The community features make it feel like home wherever I am."
            </p>
            <p className="text-xs text-gray-500 mt-2">- Maria S., Cape Verde Diaspora</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanValueProposition;
