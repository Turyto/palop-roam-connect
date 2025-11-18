
import { Globe, Users, Wifi } from "lucide-react";
import { coverageMetrics } from "@/data/coverageClusters";

const CoverageMetricsBar = () => {
  return (
    <div className="bg-gradient-to-r from-palop-green/10 via-palop-blue/10 to-palop-yellow/10 rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-center md:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-palop-green/20 rounded-full flex items-center justify-center">
              <Globe className="h-5 w-5 text-palop-green" />
            </div>
            <div>
              <div className="text-2xl font-bold text-palop-green">
                {coverageMetrics.totalCountries}
              </div>
              <div className="text-sm text-gray-600">Countries Covered</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-palop-blue/20 rounded-full flex items-center justify-center">
              <Wifi className="h-5 w-5 text-palop-blue" />
            </div>
            <div>
              <div className="text-2xl font-bold text-palop-blue">
                {coverageMetrics.averageCoverage}%
              </div>
              <div className="text-sm text-gray-600">Average Coverage</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-palop-yellow/20 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-palop-green" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                PALOP Focused
              </div>
              <div className="text-sm text-gray-600">Community Tailored</div>
            </div>
          </div>
        </div>
        
        <div className="text-center md:text-right">
          <p className="text-lg font-medium text-gray-800 mb-1">
            {coverageMetrics.keySellingPoint}
          </p>
          <p className="text-sm text-gray-600">
            Covering PALOP, Africa & Europe
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoverageMetricsBar;
