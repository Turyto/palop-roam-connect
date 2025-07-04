
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, DollarSign, Settings } from "lucide-react";
import CatalogMetrics from "./catalog/CatalogMetrics";
import PlansCatalogTab from "./catalog/PlansCatalogTab";
import SupplierRatesTab from "./catalog/SupplierRatesTab";
import PricingRulesTab from "./catalog/PricingRulesTab";

const AdminInventory = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Catalog Management</h2>
          <p className="text-gray-600 mt-1">Manage your virtual plan catalog, supplier rates, and pricing rules</p>
        </div>
      </div>

      {/* Metrics Overview */}
      <CatalogMetrics />

      {/* Tabbed Interface */}
      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
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
      </Tabs>
    </div>
  );
};

export default AdminInventory;
