import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Printer } from "lucide-react";
import { formatEUR, formatDate } from "@/hooks/usePartnerDashboard";

interface PartnerCode {
  id: string;
  code: string;
  label: string | null;
  user_id: string;
}

interface CommissionRow {
  id: string;
  order_id: string | null;
  customer_name: string | null;
  amount: number;
  rate: number;
  status: string;
  commission_date: string;
}

interface ConsignmentRow {
  id: string;
  batch_id: string | null;
  plan_name: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  status: string;
  created_at: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

const PartnerMonthlySummary = () => {
  const now = new Date();
  const [partnerCode, setPartnerCode] = useState<string>("");
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [params, setParams] = useState<{ code: string; month: number; year: number } | null>(null);

  const years = Array.from({ length: now.getFullYear() - 2025 + 2 }, (_, i) => 2025 + i);

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

  const partner = partners.find((p) => p.code === params?.code);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-partner-monthly-summary", params?.code, params?.year, params?.month],
    enabled: !!params && !!partner,
    queryFn: async () => {
      if (!params || !partner) throw new Error("No parameters");
      const start = `${params.year}-${pad(params.month)}-01`;
      const endDate = params.month === 12
        ? `${params.year + 1}-01-01`
        : `${params.year}-${pad(params.month + 1)}-01`;

      const [comm, cons] = await Promise.all([
        supabase
          .from("partner_commissions")
          .select("id, order_id, customer_name, amount, rate, status, commission_date")
          .eq("partner_code", partner.code)
          .gte("commission_date", start)
          .lt("commission_date", endDate)
          .order("commission_date", { ascending: true }),
        supabase
          .from("consignment_orders")
          .select("id, batch_id, plan_name, quantity, unit_price, total_value, status, created_at")
          .eq("partner_id", partner.user_id)
          .gte("created_at", start)
          .lt("created_at", endDate)
          .order("created_at", { ascending: true }),
      ]);
      if (comm.error) throw comm.error;
      if (cons.error) throw cons.error;
      return {
        commissions: (comm.data ?? []) as CommissionRow[],
        consignment: (cons.data ?? []) as ConsignmentRow[],
      };
    },
  });

  const nonCancelled = (data?.commissions ?? []).filter((c) => c.status !== "cancelled");
  const commEarned = nonCancelled.reduce((s, c) => s + Number(c.amount), 0);
  const commPaid = nonCancelled.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);
  const commPending = nonCancelled.filter((c) => c.status === "owed").reduce((s, c) => s + Number(c.amount), 0);
  const consPending = (data?.consignment ?? []).filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.total_value), 0);
  const consPaid = (data?.consignment ?? []).filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.total_value), 0);

  const handlePrint = () => {
    document.body.classList.add("print-partner-summary");
    try {
      window.print();
    } finally {
      document.body.classList.remove("print-partner-summary");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Monthly Partner Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>Partner</Label>
            <Select value={partnerCode} onValueChange={setPartnerCode}>
              <SelectTrigger className="w-[200px]" data-testid="select-summary-partner">
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
            <Label>Month</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-[140px]" data-testid="select-summary-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[100px]" data-testid="select-summary-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setParams({ code: partnerCode, month, year })}
            disabled={!partnerCode}
            className="bg-palop-green hover:bg-palop-green/90 text-white"
            data-testid="button-generate-summary"
          >
            Generate
          </Button>
          {params && data && (
            <Button variant="outline" onClick={handlePrint} data-testid="button-print-summary">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
        </div>

        {params && isLoading && (
          <div className="text-center py-6 text-gray-400 text-sm">Loading summary…</div>
        )}
        {params && isError && (
          <div className="text-center py-6 text-red-500 text-sm" data-testid="text-summary-error">
            Failed to load summary data. Try again.
          </div>
        )}

        {params && data && partner && (
          <div
            id="partner-monthly-summary"
            className="border rounded-lg p-6 bg-white space-y-6"
            data-testid="section-monthly-summary"
          >
            <div>
              <h2 className="text-lg font-bold">PALOP Connect — Partner Monthly Summary</h2>
              <p className="text-sm text-gray-600">
                Partner: <strong>{partner.label ?? partner.code}</strong> ({partner.code})
              </p>
              <p className="text-sm text-gray-600">
                Period: <strong>{MONTHS[params.month - 1]} {params.year}</strong>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2 uppercase tracking-wide text-gray-700">
                Part 1: Commission sales
              </h3>
              {data.commissions.length === 0 ? (
                <p className="text-sm text-gray-400">No commission sales in this period.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-1.5 pr-2 font-medium">Date</th>
                      <th className="py-1.5 pr-2 font-medium">Order ref</th>
                      <th className="py-1.5 pr-2 font-medium">Customer</th>
                      <th className="py-1.5 pr-2 font-medium text-right">Rate</th>
                      <th className="py-1.5 pr-2 font-medium text-right">Amount</th>
                      <th className="py-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.commissions.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100">
                        <td className="py-1.5 pr-2">{formatDate(c.commission_date)}</td>
                        <td className="py-1.5 pr-2 font-mono text-xs">{c.order_id ? c.order_id.slice(0, 8) : "—"}</td>
                        <td className="py-1.5 pr-2">{c.customer_name ?? "—"}</td>
                        <td className="py-1.5 pr-2 text-right">{Number((Number(c.rate) * 100).toFixed(1))}%</td>
                        <td className="py-1.5 pr-2 text-right">{formatEUR(c.amount)}</td>
                        <td className="py-1.5 capitalize">{c.status === "owed" ? "Pending" : c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="text-sm mt-2">
                Subtotal — earned: <strong>{formatEUR(commEarned)}</strong> · paid:{" "}
                <strong>{formatEUR(commPaid)}</strong> · pending: <strong>{formatEUR(commPending)}</strong>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2 uppercase tracking-wide text-gray-700">
                Part 2: Consignment orders
              </h3>
              {data.consignment.length === 0 ? (
                <p className="text-sm text-gray-400">No consignment orders in this period.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-1.5 pr-2 font-medium">Date</th>
                      <th className="py-1.5 pr-2 font-medium">Batch ID</th>
                      <th className="py-1.5 pr-2 font-medium">Plan</th>
                      <th className="py-1.5 pr-2 font-medium text-right">Qty</th>
                      <th className="py-1.5 pr-2 font-medium text-right">Unit price</th>
                      <th className="py-1.5 pr-2 font-medium text-right">Total</th>
                      <th className="py-1.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.consignment.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100">
                        <td className="py-1.5 pr-2">{formatDate(c.created_at)}</td>
                        <td className="py-1.5 pr-2 font-mono text-xs">{c.batch_id ?? "—"}</td>
                        <td className="py-1.5 pr-2">{c.plan_name}</td>
                        <td className="py-1.5 pr-2 text-right">{c.quantity}</td>
                        <td className="py-1.5 pr-2 text-right">{formatEUR(c.unit_price)}</td>
                        <td className="py-1.5 pr-2 text-right">{formatEUR(c.total_value)}</td>
                        <td className="py-1.5 capitalize">{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="text-sm mt-2">
                Subtotal — pending invoice: <strong>{formatEUR(consPending)}</strong> · paid:{" "}
                <strong>{formatEUR(consPaid)}</strong>
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-2 uppercase tracking-wide text-gray-700">Totals</h3>
              <p className="text-sm">
                Amount PALOP Connect owes partner (commissions pending):{" "}
                <strong data-testid="text-summary-owes-partner">{formatEUR(commPending)}</strong>
              </p>
              <p className="text-sm">
                Amount partner owes PALOP Connect (consignment pending invoice):{" "}
                <strong data-testid="text-summary-partner-owes">{formatEUR(consPending)}</strong>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerMonthlySummary;
