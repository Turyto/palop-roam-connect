
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, DollarSign, Settings, Warehouse, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CatalogMetrics from "./catalog/CatalogMetrics";
import PlansCatalogTab from "./catalog/PlansCatalogTab";
import SupplierRatesTab from "./catalog/SupplierRatesTab";
import PricingRulesTab from "./catalog/PricingRulesTab";
import SupplierStockTab from "./catalog/SupplierStockTab";

const AdminInventory = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Catalog Management</h2>
          <p className="text-gray-600 mt-1">Manage your virtual plan catalog, supplier rates, pricing rules, and supplier stock</p>
        </div>
      </div>

      {/* Metrics Overview */}
      <CatalogMetrics />

      <SupplierRatesStalenessNudge />

      {/* Tabbed Interface */}
      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Plans Catalog
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Supplier Rates
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pricing Rules
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2" data-testid="tab-supplier-stock">
            <Warehouse className="h-4 w-4" />
            Supplier Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <PlansCatalogTab />
        </TabsContent>

        <TabsContent value="rates">
          <SupplierRatesTab />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingRulesTab />
        </TabsContent>

        <TabsContent value="stock">
          <SupplierStockTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Gentle reminder when stored supplier costs haven't been refreshed in a
// while — stale costs mean margins shown in the catalog may be wrong.
const SupplierRatesStalenessNudge = () => {
  const { data: lastUpdated } = useQuery({
    queryKey: ["supplier-rates-last-updated"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_rates")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.updated_at ?? null;
    },
  });

  if (!lastUpdated) return null;

  const days = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (24 * 60 * 60 * 1000)
  );
  if (days < 7) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3"
      data-testid="banner-rates-stale"
    >
      <Clock className="h-5 w-5 shrink-0 text-amber-600" />
      <p className="text-sm text-amber-800">
        Supplier rates were last updated <strong>{days} days ago</strong>. Costs
        may have changed — open the <strong>Supplier Rates</strong> tab and
        compare against live prices to keep your margins accurate.
      </p>
    </div>
  );
};

export default AdminInventory;
