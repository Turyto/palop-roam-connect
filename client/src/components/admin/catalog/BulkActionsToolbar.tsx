
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, X } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onActivateAll: () => void;
  onDeactivateAll: () => void;
  onDeleteAll: () => void;
  onClearSelection: () => void;
}

const BulkActionsToolbar = ({
  selectedCount,
  onActivateAll,
  onDeactivateAll,
  onDeleteAll,
  onClearSelection,
}: BulkActionsToolbarProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {selectedCount} plan{selectedCount !== 1 ? "s" : ""} selected
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
          <Button
            size="sm"
            variant="outline"
            onClick={onDeleteAll}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
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
