import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Gift, TrendingUp, Users, Euro } from "lucide-react";

interface ReferralCodeRow {
  code: string;
  uses_count: number;
  type: string | null;
  created_at: string;
  orderRevenue: number;
  pendingRewards: number;
  paidRewards: number;
}

interface RewardRow {
  id: string;
  referral_code: string;
  amount: number;
  status: string;
  created_at: string;
}

const AdminReferrals = () => {
  const { data: codes = [], isLoading: codesLoading } = useQuery({
    queryKey: ['admin-referral-codes'],
    queryFn: async () => {
      const { data: referralCodes, error } = await supabase
        .from('referral_codes')
        .select('code, uses_count, created_at')
        .order('uses_count', { ascending: false });

      if (error) throw error;

      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('referral_code, amount, status');

      const { data: orders } = await supabase
        .from('orders')
        .select('referral_code, price, status')
        .not('referral_code', 'is', null)
        .eq('status', 'completed');

      return (referralCodes ?? []).map((rc) => {
        const codeRewards = (rewards ?? []).filter(r => r.referral_code === rc.code);
        const codeOrders = (orders ?? []).filter(o => o.referral_code === rc.code);
        return {
          code: rc.code,
          uses_count: rc.uses_count ?? 0,
          type: null,
          created_at: rc.created_at,
          orderRevenue: codeOrders.reduce((s, o) => s + Number(o.price), 0),
          pendingRewards: codeRewards.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.amount), 0),
          paidRewards: codeRewards.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.amount), 0),
        } as ReferralCodeRow;
      });
    },
  });

  const { data: recentRewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['admin-referral-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('id, referral_code, amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as RewardRow[];
    },
  });

  const totalReferralOrders = codes.reduce((s, c) => s + c.uses_count, 0);
  const totalRevenue = codes.reduce((s, c) => s + c.orderRevenue, 0);
  const totalPending = codes.reduce((s, c) => s + c.pendingRewards, 0);
  const topCode = codes[0]?.code ?? '—';

  const getRewardStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[status] ?? 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <p className="text-xs text-gray-400 mt-1">Awaiting payout</p>
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

      {/* Referral Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Referral Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {codesLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No referral codes yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Revenue Generated</TableHead>
                  <TableHead>Pending Rewards</TableHead>
                  <TableHead>Paid Rewards</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell className="font-mono font-semibold text-palop-green">{row.code}</TableCell>
                    <TableCell>{row.uses_count}</TableCell>
                    <TableCell>€{row.orderRevenue.toFixed(2)}</TableCell>
                    <TableCell>
                      {row.pendingRewards > 0
                        ? <span className="text-yellow-700 font-medium">€{row.pendingRewards.toFixed(2)}</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </TableCell>
                    <TableCell>
                      {row.paidRewards > 0
                        ? <span className="text-green-700 font-medium">€{row.paidRewards.toFixed(2)}</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                    <TableCell className="font-mono text-sm text-palop-green">{r.referral_code}</TableCell>
                    <TableCell className="font-medium">€{Number(r.amount).toFixed(2)}</TableCell>
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
