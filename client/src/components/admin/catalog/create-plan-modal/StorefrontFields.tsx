
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StorefrontSettings } from "@/hooks/useCreatePlan";

interface StorefrontFieldsProps {
  storefront: StorefrontSettings;
  onChange: (settings: StorefrontSettings) => void;
}

const TABS = [
  { value: "none", label: "Hidden (not on store page)" },
  { value: "europe", label: "Europe" },
  { value: "south-africa", label: "South Africa" },
  { value: "brazil", label: "Brazil" },
  { value: "palop", label: "PALOP" },
];

const COUNTRIES = [
  { value: "mozambique", label: "Mozambique" },
  { value: "cabo-verde", label: "Cabo Verde" },
  { value: "guinea-bissau", label: "Guinea-Bissau" },
  { value: "angola", label: "Angola" },
];

const StorefrontFields = ({ storefront, onChange }: StorefrontFieldsProps) => {
  const set = (patch: Partial<StorefrontSettings>) => onChange({ ...storefront, ...patch });
  const onStore = storefront.coverage_tab !== "none";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Store Page</CardTitle>
        <p className="text-sm text-gray-600">
          Choose where this plan appears on the public store page. Hidden plans can still be managed here.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Store Tab</Label>
            <Select value={storefront.coverage_tab} onValueChange={(v) => set({ coverage_tab: v })}>
              <SelectTrigger data-testid="select-coverage-tab">
                <SelectValue placeholder="Select tab" />
              </SelectTrigger>
              <SelectContent>
                {TABS.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {storefront.coverage_tab === "palop" && (
            <div>
              <Label>Country *</Label>
              <Select value={storefront.country_key} onValueChange={(v) => set({ country_key: v })}>
                <SelectTrigger data-testid="select-country-key">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {onStore && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sf-data-gb">Data (GB) *</Label>
                <Input
                  id="sf-data-gb"
                  type="number"
                  step="0.5"
                  min="0"
                  value={storefront.data_gb}
                  onChange={(e) => set({ data_gb: e.target.value })}
                  placeholder="e.g. 5"
                  data-testid="input-data-gb"
                />
              </div>
              <div>
                <Label htmlFor="sf-validity">Validity (days) *</Label>
                <Input
                  id="sf-validity"
                  type="number"
                  step="1"
                  min="1"
                  value={storefront.validity_days}
                  onChange={(e) => set({ validity_days: e.target.value })}
                  placeholder="e.g. 30"
                  data-testid="input-validity-days"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sf-subtitle-pt">Subtitle (Portuguese)</Label>
                <Input
                  id="sf-subtitle-pt"
                  value={storefront.subtitle_pt}
                  onChange={(e) => set({ subtitle_pt: e.target.value })}
                  placeholder="Ex: Ideal para uso diário"
                  data-testid="input-subtitle-pt"
                />
              </div>
              <div>
                <Label htmlFor="sf-subtitle-en">Subtitle (English)</Label>
                <Input
                  id="sf-subtitle-en"
                  value={storefront.subtitle_en}
                  onChange={(e) => set({ subtitle_en: e.target.value })}
                  placeholder="e.g. Ideal for daily use"
                  data-testid="input-subtitle-en"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="sf-popular"
                checked={storefront.is_popular}
                onCheckedChange={(v) => set({ is_popular: v === true })}
                data-testid="checkbox-popular"
              />
              <Label htmlFor="sf-popular" className="cursor-pointer">
                Mark as "Most popular"
              </Label>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StorefrontFields;
