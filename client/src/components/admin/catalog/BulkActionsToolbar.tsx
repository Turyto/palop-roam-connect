
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, X } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onActivateAll: () => void;
  onDeactivateAll: () => void;
  onClearSelection: () => void;
}

const BulkActionsToolbar = ({ 
  selectedCount, 
  onActivateAll, 
  onDeactivateAll, 
  onClearSelection 
}: BulkActionsToolbarProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {selectedCount} plan{selectedCount !== 1 ? 's' : ''} selected
        </Badge>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={onActivateAll}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Activate All
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDeactivateAll}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Deactivate All
          </Button>
        </div>
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={onClearSelection}
        className="flex items-center gap-2"
      >
        <X className="h-4 w-4" />
        Clear Selection
      </Button>
    </div>
  );
};

export default BulkActionsToolbar;
