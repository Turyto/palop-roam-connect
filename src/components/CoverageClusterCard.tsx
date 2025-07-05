
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import CountryFlagChip from "./CountryFlagChip";
import { CoverageCluster } from "@/data/coverageClusters";

interface CoverageClusterCardProps {
  cluster: CoverageCluster;
}

const CoverageClusterCard = ({ cluster }: CoverageClusterCardProps) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className={`h-3 ${cluster.color} rounded-t-lg -mx-6 -mt-6 mb-4`}></div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {cluster.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {cluster.tagline}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col">
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Covered Countries ({cluster.countries.length})
          </h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {cluster.countries.map((country) => (
              <CountryFlagChip
                key={country.code}
                name={country.name}
                flag={country.flag}
                size="sm"
              />
            ))}
          </div>
        </div>
        
        <div className="mt-auto">
          <Button 
            className={`w-full ${cluster.color} hover:opacity-90 text-white font-medium`}
            asChild
          >
            <Link to={cluster.ctaLink}>
              {cluster.ctaText}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoverageClusterCard;
