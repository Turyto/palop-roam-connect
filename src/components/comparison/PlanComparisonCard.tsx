
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface PlanFeatures {
  dataAllowance: string;
  validityPeriod: string;
  qrActivation: boolean;
  diasporaGifting: boolean;
  palopRoaming: boolean;
  prioritySupport: boolean;
  cplpCoverage: boolean;
}

export interface PlanData {
  id: string;
  name: string;
  clusterName: string;
  data: string;
  duration: string;
  price: string;
  color: string;
  badgeColor: string;
  countries: Array<{name: string; flag: string; code: string}>;
  popular?: boolean;
  features: PlanFeatures;
}

interface PlanComparisonCardProps {
  plan: PlanData;
  featureLabels: Record<keyof PlanFeatures, string>;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  isMobile: boolean;
}

const PlanComparisonCard = ({ 
  plan, 
  featureLabels, 
  isExpanded, 
  onToggleExpansion, 
  isMobile 
}: PlanComparisonCardProps) => {
  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-4 w-4 text-palop-green mx-auto" />
      ) : (
        <X className="h-4 w-4 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm font-medium text-center">{value}</span>;
  };

  return (
    <Card className={`relative transition-all duration-300 hover:shadow-lg ${plan.popular ? 'border-2 border-palop-blue' : 'border border-gray-200'} ${isMobile ? '' : 'hover:-translate-y-1'} flex flex-col`}>
      {plan.popular && (
        <div className="absolute -top-3 right-4 bg-palop-blue text-white px-3 py-1 text-xs font-bold rounded-full z-10">
          Most Popular
        </div>
      )}
      
      <Badge className={`absolute -top-2 left-4 ${plan.badgeColor} text-white text-xs z-10 font-semibold`}>
        {plan.clusterName}
      </Badge>
      
      <CardHeader className={`${plan.color} text-white text-center py-6 pt-8 flex-shrink-0`}>
        <CardTitle className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold leading-tight`}>{plan.name}</CardTitle>
        <div className="text-sm opacity-90 mb-2">{plan.data} • {plan.duration}</div>
        <div className={`${isMobile ? 'text-3xl' : 'text-2xl'} font-bold mb-4`}>{plan.price}</div>
        
        {/* Coverage Countries */}
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-xs opacity-80 mb-2">Coverage{isMobile ? ' Countries' : ''}</p>
          <div className={`flex flex-wrap gap-1 justify-center ${isMobile ? 'max-h-16' : 'max-h-12'} overflow-y-auto`}>
            {plan.countries.slice(0, isMobile ? 8 : 6).map((country) => (
              <span key={country.code} className={`${isMobile ? 'text-lg' : 'text-sm'}`}>{country.flag}</span>
            ))}
            {plan.countries.length > (isMobile ? 8 : 6) && (
              <span className={`text-xs bg-white/20 ${isMobile ? 'px-2 py-1' : 'px-1 py-0.5'} rounded${isMobile ? '-full' : ''}`}>
                +{plan.countries.length - (isMobile ? 8 : 6)}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-grow flex flex-col">
        {isMobile && (
          <Button
            variant="ghost"
            onClick={onToggleExpansion}
            className="w-full flex items-center justify-between mb-4"
          >
            <span>View Features</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
        
        {(isExpanded || !isMobile) && (
          <div className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? 'mb-6 animate-fade-in' : 'flex-grow'}`}>
            {Object.entries(featureLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium text-left">{label}</span>
                <div className="flex justify-end">{renderFeatureValue(plan.features[key as keyof PlanFeatures])}</div>
              </div>
            ))}
          </div>
        )}
        
        <Button className={`w-full bg-palop-green hover:bg-palop-green/90 text-white font-semibold ${!isMobile ? 'mt-6' : ''}`} asChild>
          <Link to={`/purchase?plan=${plan.id}`}>Choose {plan.clusterName}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanComparisonCard;
