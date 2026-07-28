import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
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
  Gift,
  TrendingUp,
  Users,
  Euro,
  Copy,
  Check,
  Plus,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  ShoppingBag,
  Handshake,
} from "lucide-react";

interface ReferralCodeRow {
  id: string;
  code: string;
  label: string | null;
  type: string;
  is_active: boolean;
  uses_count: number;
  created_at: string;
  orderRevenue: number;
  pendingRewards: number;
  paidRewards: number;
  recentOrders: OrderRow[];
}

interface RewardRow {
  id: string;
  referral_code: string;
  amount: number;
  status: string;
  created_at: string;
}

interface OrderRow {
  id: string;
  referral_code: string | null;
  price: number;
  status: string;
  created_at: string;
  plan_name?: string;
}

const PARTNER_LINK_BASE = "https://palopconnect.com/plans?ref=";

const AdminReferrals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreator, setShowCreator] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [codeError, setCodeError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [inviteResult, setInviteResult] = useState<{
    code: string;
    email: string;
    tempPassword: string | null;
    existingUser: boolean;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const { data: codes = [], isLoading: codesLoading } = useQuery({
    queryKey: ["admin-referral-codes"],
    queryFn: async () => {
      const { data: referralCodes, error } = await supabase
        .from("referral_codes")
        .select("id, code, label, type, is_active, uses_count, created_at")
        .order("uses_count", { ascending: false });

      if (error) throw error;

      const { data: rewards } = await supabase
        .from("referral_rewards")
        .select("referral_code, amount, status");

      const { data: orders } = await supabase
        .from("orders")
        .select("id, referral_code, price, status, created_at")
        .not("referral_code", "is", null)
        .order("created_at", { ascending: false });

      return (referralCodes ?? []).map((rc) => {
        const codeRewards = (rewards ?? []).filter(
          (r) => r.referral_code === rc.code
        );
        const codeOrders = (orders ?? []).filter(
          (o) => o.referral_code === rc.code
        );
        const completedOrders = codeOrders.filter((o) => o.status === "completed");
        return {
          id: rc.id,
          code: rc.code,
          label: rc.label ?? null,
          type: rc.type ?? "customer",
          is_active: rc.is_active,
          uses_count: rc.uses_count ?? 0,
          created_at: rc.created_at,
          orderRevenue: completedOrders.reduce(
            (s, o) => s + Number(o.price),
            0
          ),
          pendingRewards: codeRewards
            .filter((r) => r.status === "pending")
            .reduce((s, r) => s + Number(r.amount), 0),
          paidRewards: codeRewards
            .filter((r) => r.status === "paid")
            .reduce((s, r) => s + Number(r.amount), 0),
          recentOrders: codeOrders.slice(0, 10) as OrderRow[],
        } as ReferralCodeRow;
      });
    },
  });

  const { data: recentRewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ["admin-referral-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_rewards")
        .select("id, referral_code, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as RewardRow[];
    },
  });

  const { data: commissionsOwed = { byCode: {} as Record<string, number>, total: 0 } } =
    useQuery({
      queryKey: ["admin-referral-commissions-owed"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("partner_commissions")
          .select("partner_code, amount, status")
          .eq("status", "owed");
        if (error) throw error;
        const byCode: Record<string, number> = {};
        let total = 0;
        (data ?? []).forEach((c) => {
          const amt = Number(c.amount);
          total += amt;
          if (c.partner_code) {
            const key = c.partner_code.trim().toUpperCase();
            byCode[key] = (byCode[key] ?? 0) + amt;
          }
        });
        return { byCode, total };
      },
    });

  const createCodeMutation = useMutation({
    mutationFn: async ({
      code,
      label,
    }: {
      code: string;
      label: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("referral_codes").insert({
        user_id: user.id,
        code: code.toUpperCase().trim(),
        label: label.trim(),
        type: "partner",
        is_active: true,
        uses_count: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-codes"] });
      toast({ title: "Partner code created", description: `${partnerCode} is now live.` });
      setPartnerName("");
      setPartnerCode("");
      setShowCreator(false);
    },
    onError: (e: any) => {
      toast({
        title: "Failed to create code",
        description: e.message?.includes("duplicate") ? "This code already exists." : e.message,
        variant: "destructive",
      });
    },
  });

  const invitePartnerMutation = useMutation({
    mutationFn: async ({
      email,
      code,
      label,
    }: {
      email: string;
      code: string;
      label: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("invite-partner", {
        body: { email, code, partner_name: label },
      });
      if (error) {
        // Surface the function's own error message when available
        let message = error.message;
        try {
          const ctx = await (error as any).context?.json?.();
          if (ctx?.error) message = ctx.error;
        } catch { /* keep default */ }
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);
      return data as {
        code: string;
        email: string;
        temp_password: string | null;
        existing_user: boolean;
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-codes"] });
      setInviteResult({
        code: data.code,
        email: data.email,
        tempPassword: data.temp_password,
        existingUser: data.existing_user,
      });
      toast({
        title: "Partner onboarded",
        description: data.existing_user
          ? `${data.email} was promoted to partner and linked to ${data.code}.`
          : `Account created for ${data.email} and linked to ${data.code}.`,
      });
      setPartnerName("");
      setPartnerCode("");
      setPartnerEmail("");
      setShowCreator(false);
    },
    onError: (e: any) => {
      toast({
        title: "Failed to onboard partner",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("referral_codes")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referral-codes"] });
    },
  });

  const handleNameChange = (name: string) => {
    setPartnerName(name);
    const derived = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 20);
    setPartnerCode(derived);
    setCodeError("");
  };

  const handleCodeChange = (code: string) => {
    const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    setPartnerCode(clean);
    if (clean.length < 3) setCodeError("Code must be at least 3 characters.");
    else setCodeError("");
  };

  const handleCreate = () => {
    if (!partnerName.trim()) return;
    if (partnerCode.length < 3) {
      setCodeError("Code must be at least 3 characters.");
      return;
    }
    const email = partnerEmail.trim().toLowerCase();
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError("Enter a valid email address.");
        return;
      }
      setEmailError("");
      invitePartnerMutation.mutate({ email, code: partnerCode, label: partnerName });
    } else {
      createCodeMutation.mutate({ code: partnerCode, label: partnerName });
    }
  };

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${PARTNER_LINK_BASE}${code}`);
    setCopiedCode(code);
    toast({ title: "Link copied!", description: `${PARTNER_LINK_BASE}${code}` });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalReferralOrders = codes.reduce((s, c) => s + c.uses_count, 0);
  const totalRevenue = codes.reduce((s, c) => s + c.orderRevenue, 0);
  const totalPending = codes.reduce((s, c) => s + c.pendingRewards, 0);
  const topCode = codes[0]?.code ?? "—";

  const getRewardStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colors[status] ?? "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Referral Orders</p>
              <div className="p-1.5 rounded-full bg-blue-50">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalReferralOrders}</p>
            <p className="text-xs text-gray-400 mt-1">Completed via referral link</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Referral Revenue</p>
              <div className="p-1.5 rounded-full bg-emerald-50">
                <Euro className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">€{totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">From referred customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Pending Rewards</p>
              <div className="p-1.5 rounded-full bg-yellow-50">
                <Gift className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">€{totalPending.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Customer referral rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Commissions Owed</p>
              <div className="p-1.5 rounded-full bg-blue-50">
                <Handshake className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p
              className="text-2xl font-bold text-gray-900"
              data-testid="text-referrals-commissions-owed"
            >
              €{commissionsOwed.total.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Partner payouts owed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Top Code</p>
              <div className="p-1.5 rounded-full bg-purple-50">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 font-mono">{topCode}</p>
            <p className="text-xs text-gray-400 mt-1">Most uses</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Partner Code */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Partner Code
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreator((v) => !v)}
            >
              {showCreator ? "Cancel" : "New Partner"}
            </Button>
          </div>
        </CardHeader>
        {showCreator && (
          <CardContent className="pt-0">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="partner-name">Partner Name</Label>
                  <Input
                    id="partner-name"
                    placeholder="e.g. Praiatur"
                    value={partnerName}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="partner-code">
                    Code{" "}
                    <span className="text-gray-400 font-normal">(auto-generated, editable)</span>
                  </Label>
                  <Input
                    id="partner-code"
                    placeholder="PRAIATUR"
                    value={partnerCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="font-mono"
                  />
                  {codeError && (
                    <p className="text-xs text-red-600">{codeError}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="partner-email">
                  Partner Email{" "}
                  <span className="text-gray-400 font-normal">(optional — creates their account too)</span>
                </Label>
                <Input
                  id="partner-email"
                  type="email"
                  placeholder="partner@example.com"
                  value={partnerEmail}
                  onChange={(e) => {
                    setPartnerEmail(e.target.value);
                    setEmailError("");
                  }}
                  data-testid="input-partner-email"
                />
                {emailError && <p className="text-xs text-red-600">{emailError}</p>}
                <p className="text-xs text-gray-500">
                  With an email, the partner account is created (or an existing one is
                  promoted) and linked to the code — no manual steps needed.
                </p>
              </div>
              {partnerCode && (
                <p className="text-xs text-gray-500">
                  Partner link:{" "}
                  <span className="font-mono text-palop-green">
                    {PARTNER_LINK_BASE}{partnerCode}
                  </span>
                </p>
              )}
              <Button
                onClick={handleCreate}
                disabled={
                  !partnerName.trim() ||
                  partnerCode.length < 3 ||
                  createCodeMutation.isPending ||
                  invitePartnerMutation.isPending
                }
                className="bg-palop-green hover:bg-palop-green/90 text-white"
                data-testid="button-create-partner"
              >
                {createCodeMutation.isPending || invitePartnerMutation.isPending
                  ? "Creating…"
                  : partnerEmail.trim()
                    ? "Create Partner & Account"
                    : "Create Partner Code"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* One-time partner credentials */}
      {inviteResult && (
        <Card className="border-palop-green/40 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-palop-green">
                <Check className="h-4 w-4" />
                Partner onboarded — {inviteResult.code}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setInviteResult(null)} data-testid="button-dismiss-invite">
                Dismiss
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-sm">
            <p>
              Account: <span className="font-mono">{inviteResult.email}</span>
              {inviteResult.existingUser && " (existing account, promoted to partner)"}
            </p>
            {inviteResult.tempPassword ? (
              <>
                <div className="flex items-center gap-2">
                  <span>Temporary password:</span>
                  <span className="font-mono font-semibold bg-white border rounded px-2 py-1" data-testid="text-temp-password">
                    {inviteResult.tempPassword}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => copyPassword(inviteResult.tempPassword!)} data-testid="button-copy-password">
                    {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Shown only once — share it with the partner over a secure channel
                  (WhatsApp/phone). They sign in at palopconnect.com with it.
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500">
                They sign in with their existing password and will now see the partner dashboard.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Referral Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            All Referral Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {codesLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No referral codes yet.</div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">
              {codes.map((row) => (
                <div key={row.code}>
                    <div
                      onClick={() => setExpandedCode(expandedCode === row.code ? null : row.code)}
                      className={`grid grid-cols-[1fr_auto] gap-2 py-3 px-1 cursor-pointer hover:bg-gray-50 rounded transition-colors ${!row.is_active ? "opacity-50" : ""}`}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 items-center text-sm">
                        {/* Code + badges */}
                        <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                          <span className="font-mono font-semibold text-palop-green">
                            {row.code}
                          </span>
                          <Badge
                            className={
                              row.type === "partner"
                                ? "bg-blue-100 text-blue-800 text-[10px]"
                                : "bg-gray-100 text-gray-600 text-[10px]"
                            }
                          >
                            {row.type === "partner" ? "Partner" : "Customer"}
                          </Badge>
                          {!row.is_active && (
                            <Badge className="bg-red-100 text-red-700 text-[10px]">
                              Inactive
                            </Badge>
                          )}
                          {row.label && (
                            <span className="text-gray-500 text-xs">{row.label}</span>
                          )}
                        </div>

                        {/* Uses */}
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Uses</p>
                          <p className="font-semibold">{row.uses_count}</p>
                        </div>

                        {/* Revenue */}
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Revenue</p>
                          <p className="font-semibold">€{row.orderRevenue.toFixed(2)}</p>
                        </div>

                        {/* Pending rewards */}
                        <div className="text-center hidden sm:block">
                          <p className="text-xs text-gray-400">Pending</p>
                          <p className={row.pendingRewards > 0 ? "font-semibold text-yellow-700" : "text-gray-400"}>
                            {row.pendingRewards > 0 ? `€${row.pendingRewards.toFixed(2)}` : "—"}
                          </p>
                        </div>

                        {/* Partner commission owed */}
                        <div className="text-center hidden sm:block">
                          <p className="text-xs text-gray-400">Commission</p>
                          {(() => {
                            const owed = commissionsOwed.byCode[row.code.toUpperCase()] ?? 0;
                            return (
                              <p
                                className={owed > 0 ? "font-semibold text-blue-700" : "text-gray-400"}
                                data-testid={`text-code-commission-${row.code}`}
                              >
                                {owed > 0 ? `€${owed.toFixed(2)}` : "—"}
                              </p>
                            );
                          })()}
                        </div>

                        {/* Created */}
                        <div className="text-center hidden sm:block">
                          <p className="text-xs text-gray-400">Created</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(row.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Copy partner link"
                          onClick={() => copyLink(row.code)}
                        >
                          {copiedCode === row.code ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-gray-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={row.is_active ? "Deactivate" : "Activate"}
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: row.id,
                              is_active: !row.is_active,
                            })
                          }
                        >
                          {row.is_active ? (
                            <ToggleRight className="h-4 w-4 text-palop-green" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        {expandedCode === row.code ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                  {expandedCode === row.code && (
                    <div className="mx-1 mb-3 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                        <p className="text-xs font-medium text-gray-600">
                          Recent orders using <span className="font-mono">{row.code}</span>
                        </p>
                      </div>
                      {row.recentOrders.length === 0 ? (
                        <p className="text-xs text-gray-400 py-2">No orders yet for this code.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Order ID</TableHead>
                              <TableHead className="text-xs">Amount</TableHead>
                              <TableHead className="text-xs">Status</TableHead>
                              <TableHead className="text-xs">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {row.recentOrders.map((o) => (
                              <TableRow key={o.id}>
                                <TableCell className="font-mono text-xs text-gray-600">
                                  {o.id.slice(0, 8)}…
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                  €{Number(o.price).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      o.status === "completed"
                                        ? "bg-green-100 text-green-800 text-[10px]"
                                        : "bg-gray-100 text-gray-600 text-[10px]"
                                    }
                                  >
                                    {o.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">
                                  {new Date(o.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Recent Rewards (last 20)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rewardsLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
          ) : recentRewards.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No rewards yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRewards.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm text-palop-green">
                      {r.referral_code}
                    </TableCell>
                    <TableCell className="font-medium">
                      €{Number(r.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{getRewardStatusBadge(r.status)}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleDateString()}
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

export default AdminReferrals;
