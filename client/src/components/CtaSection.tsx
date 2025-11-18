
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="bg-gradient-to-r from-palop-green to-palop-blue text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Stay Connected?</h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
          Join thousands of PALOP community members enjoying seamless connectivity across borders.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-white text-palop-green hover:bg-gray-100" asChild>
            <Link to="/plans">View All Plans</Link>
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
            <Link to="/purchase">Buy eSIM Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
