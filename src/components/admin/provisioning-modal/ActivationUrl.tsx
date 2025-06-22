
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import type { ESIMActivation } from "@/types/esimActivations";

interface ActivationUrlProps {
  activation: ESIMActivation;
}

const ActivationUrl = ({ activation }: ActivationUrlProps) => {
  if (!activation.activation_url) return null;

  return (
    <div>
      <label className="text-sm font-medium text-gray-600">Activation URL</label>
      <div className="flex items-center gap-2 mt-1">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
          {activation.activation_url}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(activation.activation_url!, '_blank')}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default ActivationUrl;
