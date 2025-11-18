
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, DollarSign, MapIcon } from "lucide-react";

interface CultureData {
  culturalConnectivity?: string;
  languageSection: {
    primaryLanguages: string[];
    commonPhrases: Array<{
      phrase: string;
      meaning: string;
      phonetic: string;
    }>;
    etiquetteNote: string;
  };
  eventsSection: Array<{
    eventName: string;
    description: string;
  }>;
  bestTimesToVisit?: Array<{
    season: string;
    description: string;
  }>;
  priceIndex: {
    tourist: Array<{ item: string; priceExample: string }>;
    business: Array<{ item: string; priceExample: string }>;
    expat: Array<{ item: string; priceExample: string }>;
  };
  tipsSection: string[];
  dataSources?: string[];
}

interface CountryCultureTabProps {
  country: any;
  cultureData: CultureData;
}

const CountryCultureTab = ({ country, cultureData }: CountryCultureTabProps) => {
  return (
    <div className="bg-gradient-to-br from-palop-yellow/5 via-palop-green/5 to-palop-blue/5 p-6 rounded-lg space-y-6">
      
      {/* Cultural Connectivity Section */}
      {cultureData.culturalConnectivity && (
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-green/20">
          <h4 className="font-semibold mb-3 flex items-center text-palop-green">
            🌍 Cultural Connectivity
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {cultureData.culturalConnectivity}
          </p>
        </div>
      )}

      {/* Language & Communication Section */}
      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-green/20">
        <h4 className="font-semibold mb-3 flex items-center text-palop-green">
          <MessageCircle className="w-5 h-5 mr-2" />
          Language & Communication
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium mb-2">Primary Languages</h5>
            <div className="flex flex-wrap gap-2">
              {cultureData.languageSection.primaryLanguages.map((lang, index) => (
                <Badge key={index} variant="outline" className="bg-palop-green/10 text-palop-green border-palop-green/30">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-medium mb-2">Common Phrases</h5>
            <div className="space-y-2">
              {cultureData.languageSection.commonPhrases.map((phrase, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-palop-green">"{phrase.phrase}"</span> - {phrase.meaning}
                  <div className="text-xs text-gray-500 italic">({phrase.phonetic})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">{cultureData.languageSection.etiquetteNote}</p>
        </div>
      </div>

      {/* Events & Festivals Section */}
      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-blue/20">
        <h4 className="font-semibold mb-3 flex items-center text-palop-blue">
          <Calendar className="w-5 h-5 mr-2" />
          {country.name === "Cape Verde" ? "Major Cultural Events" : "Events & Festivals"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cultureData.eventsSection.map((event, index) => (
            <div key={index} className="bg-white/40 p-3 rounded border border-palop-blue/10">
              <h5 className="font-medium text-palop-blue mb-1">{event.eventName}</h5>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Best Times to Visit */}
      {cultureData.bestTimesToVisit && (
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-yellow/20">
          <h4 className="font-semibold mb-3 flex items-center text-palop-yellow">
            ⏰ Best Times to Visit
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cultureData.bestTimesToVisit.map((period, index) => (
              <div key={index} className="bg-white/40 p-3 rounded border border-palop-yellow/10">
                <h5 className="font-medium text-palop-yellow mb-1">{period.season}</h5>
                <p className="text-sm text-gray-600">{period.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Index Section */}
      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-yellow/20">
        <h4 className="font-semibold mb-3 flex items-center text-palop-yellow">
          <DollarSign className="w-5 h-5 mr-2" />
          Price Index
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Tourist Prices */}
          <div className="bg-white/40 p-3 rounded border border-palop-yellow/10">
            <h5 className="font-medium text-palop-yellow mb-2 flex items-center">
              🧳 Tourist
            </h5>
            <div className="space-y-2">
              {cultureData.priceIndex.tourist.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.item}</span>
                  <span className="font-medium">{item.priceExample}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business Prices */}
          <div className="bg-white/40 p-3 rounded border border-palop-yellow/10">
            <h5 className="font-medium text-palop-yellow mb-2 flex items-center">
              💼 Business Traveler
            </h5>
            <div className="space-y-2">
              {cultureData.priceIndex.business.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.item}</span>
                  <span className="font-medium">{item.priceExample}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expat Prices */}
          <div className="bg-white/40 p-3 rounded border border-palop-yellow/10">
            <h5 className="font-medium text-palop-yellow mb-2 flex items-center">
              🏠 Expat
            </h5>
            <div className="space-y-2">
              {cultureData.priceIndex.expat.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.item}</span>
                  <span className="font-medium">{item.priceExample}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Travel Tips Section */}
      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-palop-red/20">
        <h4 className="font-semibold mb-3 flex items-center text-palop-red">
          <MapIcon className="w-5 h-5 mr-2" />
          {(country.name === "Cape Verde" || country.name === "São Tomé and Príncipe" || country.name === "Guinea-Bissau") ? "Travel & Language Tips" : "Localized Travel Tips"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cultureData.tipsSection.map((tip, index) => (
            <div key={index} className="flex items-start bg-white/40 p-3 rounded border border-palop-red/10">
              <div className="w-2 h-2 bg-palop-red rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources Footer */}
      {cultureData.dataSources && (
        <div className="border-t pt-4 mt-6">
          <p className="text-xs text-gray-400">
            Data sources: {cultureData.dataSources.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default CountryCultureTab;
