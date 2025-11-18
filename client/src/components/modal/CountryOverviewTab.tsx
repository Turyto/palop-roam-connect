
import { Badge } from "@/components/ui/badge";
import { Wifi, Clock, TrendingUp, MapPin } from "lucide-react";

interface CountryOverviewTabProps {
  country: any;
  networkQuality: Record<string, { speed: string; latency: string; reliability: string }>;
  hotspots: Record<string, string[]>;
}

const CountryOverviewTab = ({ country, networkQuality, hotspots }: CountryOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-palop-green/10 p-4 rounded-lg text-center">
          <Wifi className="h-8 w-8 text-palop-green mx-auto mb-2" />
          <div className="text-2xl font-bold">{networkQuality[country.name]?.speed}</div>
          <div className="text-sm text-gray-600">Avg Speed</div>
        </div>
        <div className="bg-palop-blue/10 p-4 rounded-lg text-center">
          <Clock className="h-8 w-8 text-palop-blue mx-auto mb-2" />
          <div className="text-2xl font-bold">{networkQuality[country.name]?.latency}</div>
          <div className="text-sm text-gray-600">Latency</div>
        </div>
        <div className="bg-palop-yellow/10 p-4 rounded-lg text-center">
          <TrendingUp className="h-8 w-8 text-palop-green mx-auto mb-2" />
          <div className="text-2xl font-bold">{networkQuality[country.name]?.reliability}</div>
          <div className="text-sm text-gray-600">Reliability</div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-palop-green" />
          Popular Connection Hotspots
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {hotspots[country.name]?.map((spot, index) => (
            <Badge key={index} variant="outline" className="justify-start">
              {spot}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Network Partners</h4>
        <div className="flex flex-wrap gap-2">
          {country.partners.map((partner: string, index: number) => (
            <Badge key={index} className="bg-palop-green/10 text-palop-green">
              {partner}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountryOverviewTab;
