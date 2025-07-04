
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface SupplierRate {
  supplier_name: string;
  wholesale_cost: number;
  supplier_plan_id?: string;
  supplier_link?: string;
}

interface SupplierRateFieldsProps {
  supplierRates: SupplierRate[];
  onSupplierRatesChange: (rates: SupplierRate[]) => void;
}

const SupplierRateFields = ({ supplierRates, onSupplierRatesChange }: SupplierRateFieldsProps) => {
  const addSupplierRate = () => {
    onSupplierRatesChange([
      ...supplierRates,
      { supplier_name: '', wholesale_cost: 0, supplier_plan_id: '', supplier_link: '' }
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
                  placeholder="Optional supplier plan ID"
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SupplierRateFields;
