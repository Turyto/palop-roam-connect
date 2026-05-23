
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Zap } from "lucide-react";

interface SupplierRate {
  supplier_name: string;
  wholesale_cost: number;
  supplier_plan_id?: string;
  supplier_link?: string;
  esim_access_package_id?: string;
}

interface SupplierRateFieldsProps {
  supplierRates: SupplierRate[];
  onSupplierRatesChange: (rates: SupplierRate[]) => void;
}

// Match any supplier that is provisioned through the eSIM Access API.
// eSIMCard packages are also ordered via eSIM Access — add new names here as needed.
const isESIMAccessSupplier = (name: string) => {
  const normalised = name.toLowerCase().replace(/[\s_-]/g, '');
  return normalised.includes('esimaccess') || normalised.includes('esimcard');
};

const SupplierRateFields = ({ supplierRates, onSupplierRatesChange }: SupplierRateFieldsProps) => {
  const addSupplierRate = () => {
    onSupplierRatesChange([
      ...supplierRates,
      { supplier_name: '', wholesale_cost: 0, supplier_plan_id: '', supplier_link: '', esim_access_package_id: '' }
    ]);
  };

  const removeSupplierRate = (index: number) => {
    if (supplierRates.length > 1) {
      const newRates = supplierRates.filter((_, i) => i !== index);
      onSupplierRatesChange(newRates);
    }
  };

  const updateSupplierRate = (index: number, field: keyof SupplierRate, value: string | number) => {
    const newRates = supplierRates.map((rate, i) =>
      i === index ? { ...rate, [field]: value } : rate
    );
    onSupplierRatesChange(newRates);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Supplier Rates</CardTitle>
          <Button type="button" onClick={addSupplierRate} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Add at least one supplier with wholesale cost to calculate margins
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {supplierRates.map((rate, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Supplier {index + 1}</h4>
              {supplierRates.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSupplierRate(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`supplier_name_${index}`}>Supplier Name *</Label>
                <Input
                  id={`supplier_name_${index}`}
                  value={rate.supplier_name}
                  onChange={(e) => updateSupplierRate(index, 'supplier_name', e.target.value)}
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <Label htmlFor={`wholesale_cost_${index}`}>Wholesale Cost (€) *</Label>
                <Input
                  id={`wholesale_cost_${index}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate.wholesale_cost}
                  onChange={(e) => updateSupplierRate(index, 'wholesale_cost', Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor={`supplier_plan_id_${index}`}>Supplier Plan ID</Label>
                <Input
                  id={`supplier_plan_id_${index}`}
                  value={rate.supplier_plan_id || ''}
                  onChange={(e) => updateSupplierRate(index, 'supplier_plan_id', e.target.value)}
                  placeholder="Optional reference ID"
                />
              </div>

              <div>
                <Label htmlFor={`supplier_link_${index}`}>Supplier Link</Label>
                <Input
                  id={`supplier_link_${index}`}
                  value={rate.supplier_link || ''}
                  onChange={(e) => updateSupplierRate(index, 'supplier_link', e.target.value)}
                  placeholder="Optional supplier URL"
                />
              </div>
            </div>

            {/* eSIM Access Package Code — shown when supplier is eSIM Access */}
            {isESIMAccessSupplier(rate.supplier_name) && (
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <Label htmlFor={`esim_access_package_id_${index}`} className="text-sm font-medium">
                    eSIM Access Package Code
                  </Label>
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                    Required for delivery
                  </Badge>
                </div>
                <Input
                  id={`esim_access_package_id_${index}`}
                  value={rate.esim_access_package_id || ''}
                  onChange={(e) => updateSupplierRate(index, 'esim_access_package_id', e.target.value)}
                  placeholder="e.g. ESIM_PT_1GB_30D"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The package code from the eSIM Access dashboard. Without this, paid orders will not receive an eSIM.
                </p>
                {!rate.esim_access_package_id && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    ⚠ Package code missing — purchases will fail to provision an eSIM
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SupplierRateFields;
export type { SupplierRate };
