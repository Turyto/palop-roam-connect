
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CoverageMetricsBar from "./CoverageMetricsBar";
import CoverageClusterCard from "./CoverageClusterCard";
import { coverageClusters } from "@/data/coverageClusters";

const EnhancedCoverageSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">PALOP Coverage</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Our roaming plans provide reliable coverage throughout all PALOP countries and beyond, 
            through our partnerships with leading local carriers.
          </p>
        </div>
        
        <CoverageMetricsBar />
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {coverageClusters.map((cluster) => (
            <CoverageClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            variant="outline" 
            className="border-palop-green text-palop-green hover:bg-palop-green/10 mb-4"
            asChild
          >
            <Link to="/plans">
              Compare All Plans
            </Link>
          </Button>
          
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Our plans include the best local networks in each country to keep you connected wherever you are. 
            From Angola to Tanzania, we've got you covered.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EnhancedCoverageSection;
