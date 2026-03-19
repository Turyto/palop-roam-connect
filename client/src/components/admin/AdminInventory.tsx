
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, DollarSign, Settings, Warehouse } from "lucide-react";
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

export default AdminInventory;
