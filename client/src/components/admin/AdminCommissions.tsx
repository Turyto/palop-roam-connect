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
import {
  Euro,
  CheckCircle2,
  Clock,
  Plus,
  Handshake,
  Undo2,
  Users,
} from "lucide-react";

interface CommissionRow {
  id: string;
  partner_name: string;
  partner_code: string | null;
  amount: number;
  currency: string;
  order_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  notes: string | null;
  commission_date: string;
  created_at: string;
  rate: number;
  paid_at: string | null;
}

const AdminCommissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreator, setShowCreator] = useState(false);
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [form, setForm] = useState({
    partner_name: "",
    partner_code: "",
    amount: "",
    order_id: "",
    customer_name: "",
    commission_date: new Date().toISOString().slice(0, 10),
  });

  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["admin-partner-commissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_commissions")
        .select(
          "id, partner_name, partner_code, amount, currency, order_id, customer_name, customer_email, status, notes, commission_date, created_at, rate, paid_at"
        )
        .order("commission_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CommissionRow[];
    },
  });

  const setStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("partner_commissions")
        .update({
          status,
          paid_at: status === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-commissions"] });
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
      const amount = parseFloat(form.amount);
      if (!form.partner_name.trim()) throw new Error("Partner name is required.");
      if (isNaN(amount) || amount <= 0) throw new Error("Enter a valid amount.");
      const { error } = await supabase.from("partner_commissions").insert({
        partner_name: form.partner_name.trim(),
        partner_code: form.partner_code.trim() || null,
        amount,
        currency: "EUR",
        order_id: form.order_id.trim() || null,
        customer_name: form.customer_name.trim() || null,
        status: "owed",
        commission_date: form.commission_date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner-commissions"] });
      toast({
        title: "Commission recorded",
        description: `€${parseFloat(form.amount).toFixed(2)} owed to ${form.partner_name.trim()}.`,
      });
      setForm({
        partner_name: "",
        partner_code: "",
        amount: "",
        order_id: "",
        customer_name: "",
        commission_date: new Date().toISOString().slice(0, 10),
      });
      setShowCreator(false);
    },
    onError: (e: any) => {
      toast({
        title: "Failed to record commission",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const partners = useMemo(
    () => Array.from(new Set(commissions.map((c) => c.partner_name))).sort(),
    [commissions]
  );

  const filtered = useMemo(
    () =>
      commissions.filter(
        (c) =>
          (partnerFilter === "all" || c.partner_name === partnerFilter) &&
          (statusFilter === "all" || c.status === statusFilter)
      ),
    [commissions, partnerFilter, statusFilter]
  );

  const totalOwed = commissions
    .filter((c) => c.status === "owed")
    .reduce((s, c) => s + Number(c.amount), 0);
  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + Number(c.amount), 0);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      owed: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-600",
    };
    return (
      <Badge className={colors[status] ?? "bg-gray-100 text-gray-600"} data-testid={`badge-commission-status`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Owed to Partners</p>
              <div className="p-1.5 rounded-full bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" data-testid="text-total-owed">€{totalOwed.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Outstanding commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Paid Out</p>
              <div className="p-1.5 rounded-full bg-emerald-50">
                <Euro className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" data-testid="text-total-paid">€{totalPaid.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Settled commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Partners</p>
              <div className="p-1.5 rounded-full bg-blue-50">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" data-testid="text-partner-count">{partners.length}</p>
            <p className="text-xs text-gray-400 mt-1">With commission records</p>
          </CardContent>
        </Card>
      </div>

      {/* Record Commission */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Commission
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreator((v) => !v)}
              data-testid="button-toggle-commission-form"
            >
              {showCreator ? "Cancel" : "New Commission"}
            </Button>
          </div>
        </CardHeader>
        {showCreator && (
          <CardContent className="pt-0">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="c-partner">Partner Name</Label>
                  <Input
                    id="c-partner"
                    placeholder="e.g. Praiatur"
                    value={form.partner_name}
                    onChange={(e) => setForm({ ...form, partner_name: e.target.value })}
                    data-testid="input-partner-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-code">Partner Code <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input
                    id="c-code"
                    placeholder="PRAIATUR"
                    value={form.partner_code}
                    onChange={(e) => setForm({ ...form, partner_code: e.target.value.toUpperCase() })}
                    className="font-mono"
                    data-testid="input-partner-code"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-amount">Amount (€)</Label>
                  <Input
                    id="c-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1.49"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    data-testid="input-amount"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-customer">Customer <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input
                    id="c-customer"
                    placeholder="e.g. Salomé Delgado"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-order">Order ID <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input
                    id="c-order"
                    placeholder="full order UUID"
                    value={form.order_id}
                    onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                    className="font-mono"
                    data-testid="input-order-id"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-date">Date</Label>
                  <Input
                    id="c-date"
                    type="date"
                    value={form.commission_date}
                    onChange={(e) => setForm({ ...form, commission_date: e.target.value })}
                    data-testid="input-commission-date"
                  />
                </div>
              </div>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!form.partner_name.trim() || !form.amount || createMutation.isPending}
                className="bg-palop-green hover:bg-palop-green/90 text-white"
                data-testid="button-save-commission"
              >
                {createMutation.isPending ? "Saving…" : "Record Commission"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Ledger */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Commission Ledger
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                <SelectTrigger className="w-[160px] h-9" data-testid="select-partner-filter">
                  <SelectValue placeholder="Partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All partners</SelectItem>
                  {partners.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="owed">Owed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm" data-testid="text-no-commissions">
              No commissions match these filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} data-testid={`row-commission-${c.id}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{c.partner_name}</span>
                        {c.partner_code && (
                          <span className="font-mono text-xs text-palop-green">{c.partner_code}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {c.customer_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm" data-testid={`text-rate-${c.id}`}>
                      {c.rate != null ? `${Number((Number(c.rate) * 100).toFixed(1))}%` : "—"}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-amount-${c.id}`}>
                      €{Number(c.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(c.commission_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500" data-testid={`text-paid-date-${c.id}`}>
                      {c.status === "paid" && c.paid_at
                        ? new Date(c.paid_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status === "owed" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-palop-green text-palop-green hover:bg-palop-green/5"
                          onClick={() => setStatusMutation.mutate({ id: c.id, status: "paid" })}
                          disabled={setStatusMutation.isPending}
                          data-testid={`button-mark-paid-${c.id}`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Mark Paid
                        </Button>
                      ) : c.status === "paid" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-gray-500"
                          onClick={() => setStatusMutation.mutate({ id: c.id, status: "owed" })}
                          disabled={setStatusMutation.isPending}
                          data-testid={`button-mark-owed-${c.id}`}
                        >
                          <Undo2 className="h-3.5 w-3.5 mr-1" />
                          Mark Owed
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommissions;
