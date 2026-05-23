
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { usePlans, type Plan } from "@/hooks/usePlans";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DeletePlanDialogProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeletePlanDialog = ({ plan, isOpen, onClose }: DeletePlanDialogProps) => {
  const { deletePlan, updatePlan, isDeleting } = usePlans();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [hasOrders, setHasOrders] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check order count when dialog opens
  const handleOpenChange = async (open: boolean) => {
    if (open && plan) {
      setChecked(false);
      setOrderCount(null);
      setHasOrders(false);
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("plan_id", plan.id);
      setOrderCount(count ?? 0);
      setHasOrders((count ?? 0) > 0);
      setChecked(true);
    }
    if (!open) onClose();
  };

  const handleDelete = async () => {
    if (!plan) return;
    try {
      await deletePlan(plan.id);
      toast.success(`"${plan.name}" deleted permanently.`);
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Delete failed.");
    }
  };

  const handleDeactivate = () => {
    if (!plan) return;
    setIsDeactivating(true);
    updatePlan({ id: plan.id, updates: { status: "inactive" } });
    toast.success(`"${plan.name}" deactivated — hidden from customers.`);
    setIsDeactivating(false);
    onClose();
  };

  if (!plan) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            {hasOrders ? `Cannot delete "${plan.name}"` : `Delete "${plan.name}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-gray-600">
              {!checked ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking order history…
                </div>
              ) : hasOrders ? (
                <>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                    <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      This plan has <strong>{orderCount} order{orderCount !== 1 ? "s" : ""}</strong> in the database. Permanently deleting it would break order history records.
                    </span>
                  </div>
                  <p>
                    You can <strong>deactivate</strong> it instead — it will be hidden from customers immediately but your order records stay intact.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    This will permanently remove <strong>{plan.name}</strong> and all associated supplier rates and eSIM package mappings.
                  </p>
                  <p className="text-red-600 font-medium">This cannot be undone.</p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || isDeactivating}>
            Cancel
          </AlertDialogCancel>

          {checked && hasOrders ? (
            <Button
              onClick={handleDeactivate}
              disabled={isDeactivating}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {isDeactivating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Deactivate Instead
            </Button>
          ) : checked ? (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Permanently
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePlanDialog;
