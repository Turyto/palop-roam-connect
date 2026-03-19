import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Ticket = {
  id: string;
  subject: string;
  category: string | null;
  name: string | null;
  email: string | null;
  status: string;
  priority: string;
  created_at: string;
  message: string;
  user_id: string | null;
};

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

const AdminSupportTickets = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['/admin/support-tickets', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('id, subject, category, name, email, status, priority, created_at, message, user_id')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Ticket[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/support-tickets'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4 text-red-600" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'destructive',
      in_progress: 'secondary',
      resolved: 'default',
      closed: 'outline',
    };
    return (
      <Badge variant={variants[status] ?? 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      high: 'destructive',
      urgent: 'destructive',
      medium: 'secondary',
      low: 'outline',
    };
    return <Badge variant={variants[priority] ?? 'outline'}>{priority}</Badge>;
  };

  const nextStatus = (current: string): string | null => {
    const idx = STATUS_ORDER.indexOf(current);
    return idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Support Tickets
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/admin/support-tickets'] })}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>

        <div className="flex gap-2 mt-2 flex-wrap">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="text-center py-8 text-gray-500">Loading tickets…</div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            Unable to load tickets. Make sure you are signed in as an admin.
          </div>
        )}

        {!isLoading && !error && tickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No support tickets found.
          </div>
        )}

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-0.5 text-sm">{ticket.subject}</h4>
                  <div className="text-xs text-gray-500 space-x-2">
                    {ticket.name && <span>{ticket.name}</span>}
                    {ticket.email && <span>· {ticket.email}</span>}
                    {ticket.category && (
                      <span className="text-gray-400">· {ticket.category}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getPriorityBadge(ticket.priority)}
                  <div className="flex items-center gap-1">
                    {getStatusIcon(ticket.status)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap line-clamp-3">
                {ticket.message}
              </p>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
                <div className="flex gap-2">
                  {nextStatus(ticket.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updateStatus.isPending}
                      onClick={() =>
                        updateStatus.mutate({
                          id: ticket.id,
                          status: nextStatus(ticket.status)!,
                        })
                      }
                    >
                      Mark as {nextStatus(ticket.status)?.replace('_', ' ')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSupportTickets;
