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
  partner_code: string;
  customer_name: string | null;
  amount: number;
  rate: number;
  status: string;
  commission_date: string;
}

interface ConsignmentRow {
  id: string;
  batch_id: string | null;
  partner_id: string;
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

const ALL_PARTNERS = "__all__";

const pad = (n: number) => String(n).padStart(2, "0");

const PartnerMonthlySummary = () => {
  const now = new Date();
  // Defaults answer the routine question "what's owed this month?" with
  // zero clicks: current month, all partners, loaded automatically.
  const [partnerCode, setPartnerCode] = useState<string>(ALL_PARTNERS);
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

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

  const isAll = partnerCode === ALL_PARTNERS;
  const partner = partners.find((p) => p.code === partnerCode);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-partner-monthly-summary", partnerCode, year, month],
    // For a specific partner we need its user_id for consignment lookup.
    enabled: isAll || !!partner,
    queryFn: async () => {
      const start = `${year}-${pad(month)}-01`;
      const endDate = month === 12
        ? `${year + 1}-01-01`
        : `${year}-${pad(month + 1)}-01`;

      let commQuery = supabase
        .from("partner_commissions")
        .select("id, order_id, partner_code, customer_name, amount, rate, status, commission_date")
        .gte("commission_date", start)
        .lt("commission_date", endDate)
        .order("commission_date", { ascending: true });
      let consQuery = supabase
        .from("consignment_orders")
        .select("id, batch_id, partner_id, plan_name, quantity, unit_price, total_value, status, created_at")
        .gte("created_at", start)
        .lt("created_at", endDate)
        .order("created_at", { ascending: true });

      if (!isAll && partner) {
        commQuery = commQuery.eq("partner_code", partner.code);
        consQuery = consQuery.eq("partner_id", partner.user_id);
      }

      const [comm, cons] = await Promise.all([commQuery, consQuery]);
      if (comm.error) throw comm.error;
      if (cons.error) throw cons.error;
      return {
        commissions: (comm.data ?? []) as CommissionRow[],
        consignment: (cons.data ?? []) as ConsignmentRow[],
      };
    },
  });

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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PARTNERS}>All partners</SelectItem>
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
          {data && (
            <Button variant="outline" onClick={handlePrint} data-testid="button-print-summary">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-6 text-gray-400 text-sm">Loading summary…</div>
        )}
        {isError && (
          <div className="text-center py-6 text-red-500 text-sm" data-testid="text-summary-error">
            Failed to load summary data. Try again.
          </div>
        )}

        {data && isAll && (
          <AllPartnersSummary
            partners={partners}
            commissions={data.commissions}
            consignment={data.consignment}
            month={month}
            year={year}
          />
        )}

        {data && !isAll && partner && (
          <SinglePartnerDetail
            partner={partner}
            commissions={data.commissions}
            consignment={data.consignment}
            month={month}
            year={year}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Overview: one row per partner, answering "who is owed what this month".
const AllPartnersSummary = ({
  partners,
  commissions,
  consignment,
  month,
  year,
}: {
  partners: PartnerCode[];
  commissions: CommissionRow[];
  consignment: ConsignmentRow[];
  month: number;
  year: number;
}) => {
  const rows = partners.map((p) => {
    const comm = commissions.filter(
      (c) => c.partner_code === p.code && c.status !== "cancelled"
    );
    const cons = consignment.filter((c) => c.partner_id === p.user_id);
    return {
      partner: p,
      commEarned: comm.reduce((s, c) => s + Number(c.amount), 0),
      commPending: comm
        .filter((c) => c.status === "owed")
        .reduce((s, c) => s + Number(c.amount), 0),
      consPending: cons
        .filter((c) => c.status === "pending")
        .reduce((s, c) => s + Number(c.total_value), 0),
    };
  });

  const totalOwedToPartners = rows.reduce((s, r) => s + r.commPending, 0);
  const totalOwedByPartners = rows.reduce((s, r) => s + r.consPending, 0);
  const hasActivity = rows.some(
    (r) => r.commEarned > 0 || r.commPending > 0 || r.consPending > 0
  );

  return (
    <div
      id="partner-monthly-summary"
      className="border rounded-lg p-6 bg-white space-y-4"
      data-testid="section-all-partners-summary"
    >
      <div>
        <h2 className="text-lg font-bold">PALOP Connect — All Partners</h2>
        <p className="text-sm text-gray-600">
          Period: <strong>{MONTHS[month - 1]} {year}</strong>
        </p>
      </div>

      {!hasActivity ? (
        <p className="text-sm text-gray-400">No partner activity in this period.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-1.5 pr-2 font-medium">Partner</th>
              <th className="py-1.5 pr-2 font-medium text-right">Commissions earned</th>
              <th className="py-1.5 pr-2 font-medium text-right">We owe them</th>
              <th className="py-1.5 font-medium text-right">They owe us (consignment)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.partner.id} className="border-b border-gray-100">
                <td className="py-1.5 pr-2">
                  {r.partner.label ?? r.partner.code}{" "}
                  <span className="text-xs text-gray-400">({r.partner.code})</span>
                </td>
                <td className="py-1.5 pr-2 text-right">{formatEUR(r.commEarned)}</td>
                <td className={`py-1.5 pr-2 text-right ${r.commPending > 0 ? "font-semibold text-amber-700" : ""}`}>
                  {formatEUR(r.commPending)}
                </td>
                <td className={`py-1.5 text-right ${r.consPending > 0 ? "font-semibold text-amber-700" : ""}`}>
                  {formatEUR(r.consPending)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold">
              <td className="py-2 pr-2">Total</td>
              <td className="py-2 pr-2" />
              <td className="py-2 pr-2 text-right" data-testid="text-total-owed-partners">
                {formatEUR(totalOwedToPartners)}
              </td>
              <td className="py-2 text-right" data-testid="text-total-owed-by-partners">
                {formatEUR(totalOwedByPartners)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
      <p className="text-xs text-gray-400">
        Select a partner above for the detailed, printable statement.
      </p>
    </div>
  );
};

// Detailed printable statement for one partner (previous behavior).
const SinglePartnerDetail = ({
  partner,
  commissions,
  consignment,
  month,
  year,
}: {
  partner: PartnerCode;
  commissions: CommissionRow[];
  consignment: ConsignmentRow[];
  month: number;
  year: number;
}) => {
  const nonCancelled = commissions.filter((c) => c.status !== "cancelled");
  const commEarned = nonCancelled.reduce((s, c) => s + Number(c.amount), 0);
  const commPaid = nonCancelled.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);
  const commPending = nonCancelled.filter((c) => c.status === "owed").reduce((s, c) => s + Number(c.amount), 0);
  const consPending = consignment.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.total_value), 0);
  const consPaid = consignment.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.total_value), 0);

  return (
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
          Period: <strong>{MONTHS[month - 1]} {year}</strong>
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 uppercase tracking-wide text-gray-700">
          Part 1: Commission sales
        </h3>
        {commissions.length === 0 ? (
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
              {commissions.map((c) => (
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
        {consignment.length === 0 ? (
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
              {consignment.map((c) => (
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
  );
};

export default PartnerMonthlySummary;
