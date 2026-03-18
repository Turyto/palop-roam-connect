import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/language";
import { Link } from "react-router-dom";

const EmptyOrdersState = () => {
  const { t } = useLanguage();
  const o = t.orders;

  return (
    <div className="flex flex-col items-center justify-center min-h-[260px] text-center py-12">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{o.empty}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">{o.emptyDesc}</p>
      <Button asChild className="bg-palop-green hover:bg-palop-green/90 text-white">
        <Link to="/plans">{o.browsePlans}</Link>
      </Button>
    </div>
  );
};

export default EmptyOrdersState;
