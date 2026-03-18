
import { ESIMPlan } from "@/pages/Purchase";

interface CartOverviewProps {
  plan: ESIMPlan;
}

const CartOverview = ({ plan }: CartOverviewProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="font-semibold text-lg text-gray-900">Cart Overview</h2>
      </div>
      <div className="p-6">
        <table className="w-full">
          <thead className="text-left">
            <tr>
              <th className="py-2">NAME</th>
              <th className="py-2 text-right">PAY NOW</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4">
                <div className="font-medium">{plan.name}</div>
                <div className="text-gray-600">{plan.data} for {plan.days} days</div>
              </td>
              <td className="py-4 text-right font-bold text-palop-blue">
                {plan.price.toFixed(2)} {plan.currency}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-4">eSIM</td>
              <td className="py-4 text-right font-medium">0.00 {plan.currency}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 font-bold">TOTAL</td>
              <td className="pt-4 text-right font-bold text-palop-blue">
                {plan.price.toFixed(2)} {plan.currency}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default CartOverview;
