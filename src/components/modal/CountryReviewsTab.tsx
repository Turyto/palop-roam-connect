
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface Review {
  name: string;
  rating: number;
  text: string;
}

interface CountryReviewsTabProps {
  reviews: Review[];
}

const CountryReviewsTab = ({ reviews }: CountryReviewsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{review.name}</span>
              <div className="flex">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-palop-yellow text-palop-yellow" />
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-sm">{review.text}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10">
          View All Reviews
        </Button>
      </div>
    </div>
  );
};

export default CountryReviewsTab;
