
import { useState } from "react";
import { usePricingRules } from "@/hooks/usePlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Settings } from "lucide-react";
import WholesaleProvidersOverview from "./WholesaleProvidersOverview";

const PricingRulesTab = () => {
  const { pricingRules, isLoading, updatePricingRules, isUpdating } = usePricingRules();
  const [globalMarkup, setGlobalMarkup] = useState(pricingRules?.global_markup || 50);
  const [marginThreshold, setMarginThreshold] = useState(pricingRules?.margin_alert_threshold || 20);

  const handleSave = () => {
    updatePricingRules({
      global_markup: globalMarkup,
      margin_alert_threshold: marginThreshold,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Settings className="h-6 w-6 animate-spin mr-2" />
        <span>Loading pricing rules...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Pricing Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="globalMarkup">Default Markup (%)</Label>
              <Input
                id="globalMarkup"
                type="number"
                value={globalMarkup}
                onChange={(e) => setGlobalMarkup(Number(e.target.value))}
                placeholder="50"
              />
              <p className="text-sm text-gray-500">
                Default markup percentage applied to wholesale costs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marginThreshold">Margin Alert Threshold (%)</Label>
              <Input
                id="marginThreshold"
                type="number"
                value={marginThreshold}
                onChange={(e) => setMarginThreshold(Number(e.target.value))}
                placeholder="20"
              />
              <p className="text-sm text-gray-500">
                Alert when plan margins fall below this percentage
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Pricing Examples</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Wholesale Cost:</strong> €20.00
              </p>
              <p className="text-sm">
                <strong>With {globalMarkup}% markup:</strong> €{(20 * (1 + globalMarkup / 100)).toFixed(2)}
              </p>
              <p className="text-sm">
                <strong>Profit Margin:</strong> €{(20 * (globalMarkup / 100)).toFixed(2)} ({globalMarkup}%)
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Saving...' : 'Save Pricing Rules'}
          </Button>
        </CardContent>
      </Card>

      {/* Wholesale Providers Overview */}
      <WholesaleProvidersOverview />

      <Card>
        <CardHeader>
          <CardTitle>Plan-Specific Exceptions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Coming soon: Set custom markup rules for specific plans or tags.
          </p>
          <Button variant="outline" disabled>
            Add Exception Rule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingRulesTab;
