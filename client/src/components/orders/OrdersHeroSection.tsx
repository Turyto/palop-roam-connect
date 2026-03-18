import { useLanguage } from '@/contexts/language';
import { Package } from 'lucide-react';

const OrdersHeroSection = () => {
  const { t } = useLanguage();
  const o = t.orders;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-palop-green/10 rounded-full flex items-center justify-center">
            <Package className="h-5 w-5 text-palop-green" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">{o.title}</h1>
        </div>
        <p className="text-gray-500 text-sm md:text-base ml-12">{o.subtitle}</p>
      </div>
    </div>
  );
};

export default OrdersHeroSection;
