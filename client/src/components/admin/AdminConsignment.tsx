import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, CheckCircle2, Clock, Plus, Undo2 } from "lucide-react";

interface ConsignmentRow {
  id: string;
  partner_id: string;
  partner_code: string;
  batch_id: string | null;
  plan_name: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  status: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

interface PartnerCode {
  id: string;
  code: string;
  label: string | null;
  user_id: string;
}

const emptyForm = {
  partner_code: "",
  batch_id: "",
  plan_name: "",
  quantity: "",
  unit_price: "",
  notes: "",
};

const AdminConsignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreator, setShowCreator] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: partners = [] } = useQuery({
    queryKey: ["admin-partner-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("id, code, label, user_id")
        .eq("type", "partner")
        .order("code");
      if (error) throw error;
      return (data ?? []) as PartnerCode[];
    },
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-consignment-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consignment_orders")
        .select(
          "id, partner_id, partner_code, batch_id, plan_name, quantity, unit_price, total_value, status, paid_at, notes, created_at"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ConsignmentRow[];
    },
  });

  const partnerLabel = useMemo(() => {
    const map: Record<string, string> = {};
    partners.forEach((p) => {
      map[p.code] = p.label ?? p.code;
    });
    return map;
  }, [partners]);

  const setStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("consignment_orders")
        .update({
          status,
          paid_at: status === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-consignment-orders"] });
    },
    onError: (e: any) => {
      toast({
        title: "Update failed",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const partner = partners.find((p) => p.code === form.partner_code);
      if (!partner) throw new Error("Select a partner.");
      const quantity = parseInt(form.quantity, 10);
      const unitPrice = parseFloat(form.unit_price);
      if (!form.plan_name.trim()) throw new Error("Plan name is required.");
      if (isNaN(quantity) || quantity < 1) throw new Error("Quantity must be at least 1.");
      if (isNaN(unitPrice) || unitPrice < 0) throw new Error("Unit price must be 0 or more.");
      const { error } = await supabase.from("consignment_orders").insert({
        partner_id: partner.user_id,
        partner_code: partner.code,
        batch_id: form.batch_id.trim() || null,
        plan_name: form.plan_name.trim(),
        quantity,
        unit_price: unitPrice,
        status: "pending",
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-consignment-orders"] });
      toast({
        title: "Consignment order created",
        description: `${form.quantity} × ${form.plan_name.trim()} for ${partnerLabel[form.partner_code] ?? form.partner_code}.`,
      });
      setForm(emptyForm);
      setShowCreator(false);
    },
    onError: (e: any) => {
      toast({
        title: "Failed to create consignment order",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const totalPending = orders
    .filter((o) => o.status === "pending")
    .reduce((s, o) => s + Number(o.total_value), 0);
  const totalPaid = orders
    .filter((o) => o.status === "paid")
    .reduce((s, o) => s + Number(o.total_value), 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Pending Invoice</p>
              <div className="p-1.5 rounded-full bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" data-testid="text-consignment-pending">
              €{totalPending.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Owed by partners</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Paid</p>
              <div className="p-1.5 rounded-full bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" data-testid="text-consignment-paid">
              €{totalPaid.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Settled consignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Orders</p>
              <div className="p-1.5 rounded-full bg-blue-50">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" data-testid="text-consignment-count">
              {orders.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total consignment orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Consignment Order
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreator((v) => !v)}
              data-testid="button-toggle-consignment-form"
            >
              {showCreator ? "Cancel" : "New Order"}
            </Button>
          </div>
        </CardHeader>
        {showCreator && (
          <CardContent className="pt-0">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Partner</Label>
                  <Select
                    value={form.partner_code}
                    onValueChange={(v) => setForm({ ...form, partner_code: v })}
                  >
                    <SelectTrigger data-testid="select-consignment-partner">
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.code}>
                          {p.label ?? p.code} ({p.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cg-batch">Batch ID <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input
                    id="cg-batch"
                    placeholder="e.g. B26070616530004"
                    value={form.batch_id}
                    onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                    className="font-mono"
                    data-testid="input-consignment-batch"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cg-plan">Plan Name</Label>
                  <Input
                    id="cg-plan"
                    placeholder="e.g. Essencial 5GB"
                    value={form.plan_name}
                    onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
                    data-testid="input-consignment-plan"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cg-qty">Quantity</Label>
                  <Input
                    id="cg-qty"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="10"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    data-testid="input-consignment-quantity"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cg-price">Unit Price (€)</Label>
                  <Input
                    id="cg-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="5.90"
                    value={form.unit_price}
                    onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                    data-testid="input-consignment-unit-price"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cg-notes">Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input
                    id="cg-notes"
                    placeholder="e.g. Praia Tur consignment order, July 2026"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    data-testid="input-consignment-notes"
                  />
                </div>
              </div>
              {form.quantity && form.unit_price && !isNaN(parseInt(form.quantity, 10)) && !isNaN(parseFloat(form.unit_price)) && (
                <p className="text-xs text-gray-500">
                  Total value:{" "}
                  <span className="font-semibold text-gray-900" data-testid="text-consignment-form-total">
                    €{(parseInt(form.quantity, 10) * parseFloat(form.unit_price)).toFixed(2)}
                  </span>
                </p>
              )}
              <Button
                onClick={() => createMutation.mutate()}
                disabled={
                  !form.partner_code ||
                  !form.plan_name.trim() ||
                  !form.quantity ||
                  !form.unit_price ||
                  createMutation.isPending
                }
                className="bg-palop-green hover:bg-palop-green/90 text-white"
                data-testid="button-save-consignment"
              >
                {createMutation.isPending ? "Saving…" : "Create Order"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Consignment Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm" data-testid="text-no-consignment">
              No consignment orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} data-testid={`row-consignment-${o.id}`}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {partnerLabel[o.partner_code] ?? o.partner_code}
                          </span>
                          <span className="font-mono text-xs text-palop-green">{o.partner_code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{o.batch_id ?? "—"}</TableCell>
                      <TableCell className="text-sm">{o.plan_name}</TableCell>
                      <TableCell className="text-right">{o.quantity}</TableCell>
                      <TableCell className="text-right">€{Number(o.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium" data-testid={`text-consignment-total-${o.id}`}>
                        €{Number(o.total_value).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={o.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          data-testid={`badge-consignment-status-${o.id}`}
                        >
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {new Date(o.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-[180px] truncate" title={o.notes ?? undefined}>
                        {o.notes ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {o.status === "pending" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-palop-green text-palop-green hover:bg-palop-green/5"
                            onClick={() => setStatusMutation.mutate({ id: o.id, status: "paid" })}
                            disabled={setStatusMutation.isPending}
                            data-testid={`button-consignment-mark-paid-${o.id}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Mark Paid
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-gray-500"
                            onClick={() => setStatusMutation.mutate({ id: o.id, status: "pending" })}
                            disabled={setStatusMutation.isPending}
                            data-testid={`button-consignment-mark-pending-${o.id}`}
                          >
                            <Undo2 className="h-3.5 w-3.5 mr-1" />
                            Mark Pending
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConsignment;
