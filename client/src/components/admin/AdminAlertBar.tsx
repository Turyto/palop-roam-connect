import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeliveryProblems } from "@/hooks/useDeliveryProblems";

interface AdminAlertBarProps {
  onViewOrders: () => void;
}

/**
 * Global "needs attention" bar rendered above the tab strip so failed
 * deliveries are visible from EVERY tab, not just Orders.
 * Counts come from the shared useDeliveryProblems hook.
 */
const AdminAlertBar = ({ onViewOrders }: AdminAlertBarProps) => {
  const { data } = useDeliveryProblems();

  if (!data || data.totalProblems === 0) return null;

  const { failedOrders, failedTopups } = data;

  const parts: string[] = [];
  if (failedOrders.length > 0) {
    parts.push(
      `${failedOrders.length} paid ${failedOrders.length === 1 ? "order" : "orders"} without eSIM delivery`
    );
  }
  if (failedTopups.length > 0) {
    parts.push(
      `${failedTopups.length} paid ${failedTopups.length === 1 ? "top-up" : "top-ups"} not applied`
    );
  }

  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      data-testid="banner-global-attention"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-semibold text-red-800">
            Action needed: {parts.join(" · ")}
          </p>
          <p className="text-xs text-red-700">
            {failedOrders.length > 0 &&
              "Customers paid but did not receive their eSIM. "}
            {failedTopups.length > 0 &&
              "Top-up payments were taken but the data was not added — refund or re-apply manually. "}
          </p>
          {failedTopups.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-xs text-red-700">
              {failedTopups.slice(0, 3).map((t) => (
                <li key={t.id}>
                  Top-up {t.data_amount} · €{Number(t.price).toFixed(2)} ·{" "}
                  {new Date(t.created_at).toLocaleDateString()}
                  {t.failure_reason ? ` — ${t.failure_reason}` : ""}
                </li>
              ))}
              {failedTopups.length > 3 && (
                <li>…and {failedTopups.length - 3} more</li>
              )}
            </ul>
          )}
        </div>
      </div>
      {failedOrders.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-red-300 text-red-700 hover:bg-red-100"
          onClick={onViewOrders}
          data-testid="button-global-view-orders"
        >
          View affected orders
        </Button>
      )}
    </div>
  );
};

export default AdminAlertBar;
