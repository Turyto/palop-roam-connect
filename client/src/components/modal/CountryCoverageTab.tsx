
import { MapPin } from "lucide-react";

interface CountryCoverageTabProps {
  country: any;
}

const CountryCoverageTab = ({ country }: CountryCoverageTabProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold mb-4">Coverage Map</h4>
        <div className="bg-gradient-to-br from-palop-green/20 to-palop-blue/20 h-64 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-palop-green mx-auto mb-4" />
            <p className="text-gray-600">Interactive coverage map</p>
            <p className="text-sm text-gray-500">Showing {country.coverage} national coverage</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Urban Coverage</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Capital City</span>
              <span className="font-medium">99%</span>
            </div>
            <div className="flex justify-between">
              <span>Major Cities</span>
              <span className="font-medium">96%</span>
            </div>
            <div className="flex justify-between">
              <span>Business Districts</span>
              <span className="font-medium">98%</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Travel Routes</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Airports</span>
              <span className="font-medium">100%</span>
            </div>
            <div className="flex justify-between">
              <span>Major Highways</span>
              <span className="font-medium">92%</span>
            </div>
            <div className="flex justify-between">
              <span>Tourist Areas</span>
              <span className="font-medium">94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryCoverageTab;
