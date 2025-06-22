
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

const EmptyOrdersState = () => {
  return (
    <div className="text-center min-h-[200px] flex items-center justify-center">
      <div>
        <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-4">You haven't made any eSIM purchases yet.</p>
        <Button asChild>
          <a href="/plans">Browse Plans</a>
        </Button>
      </div>
    </div>
  );
};

export default EmptyOrdersState;
