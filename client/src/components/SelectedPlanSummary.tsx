import { Check, Lock, Mail, Headset } from 'lucide-react';
import { useLanguage } from '@/contexts/language';
import { ESIMPlan } from '@/pages/Purchase';

interface SelectedPlanSummaryProps {
  plan: ESIMPlan;
}

const SelectedPlanSummary = ({ plan }: SelectedPlanSummaryProps) => {
  const { t } = useLanguage();
  const c = t.checkout;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-palop-green/5 border-b border-palop-green/10 px-5 py-3">
          <p className="text-xs font-semibold text-palop-green uppercase tracking-wider">{c.selectedPlan}</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">{plan.name}</h2>
            <div className="text-3xl font-bold text-palop-green mt-1">€{plan.price.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-0.5">{c.data}</div>
              <div className="font-semibold text-gray-900">{plan.data}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-0.5">{c.duration}</div>
              <div className="font-semibold text-gray-900">{plan.days} dias</div>
            </div>
          </div>

          <ul className="space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-palop-green flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-palop-green/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="h-4 w-4 text-palop-green" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{c.paymentSecure}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-palop-green/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="h-4 w-4 text-palop-green" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{c.paymentDigital}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-palop-green/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Headset className="h-4 w-4 text-palop-green" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{c.paymentSupport}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedPlanSummary;
