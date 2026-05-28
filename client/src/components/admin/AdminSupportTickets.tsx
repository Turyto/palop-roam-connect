import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Clock, CheckCircle, AlertTriangle, RefreshCw, Mail, User, Tag, Calendar } from 'lucide-react';
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

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const AdminSupportTickets = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { data: tickets = [], isLoading, isFetching, error, refetch } = useQuery({
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/admin/support-tickets'] });
      if (selectedTicket?.id === variables.id) {
        setSelectedTicket((t) => t ? { ...t, status: variables.status } : t);
      }
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-400" />;
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
        {STATUS_LABELS[status] ?? status}
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
    <>
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
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh-tickets"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>

          <div className="flex gap-2 mt-2 flex-wrap">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
              <Button
                key={s}
                variant={filterStatus === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(s)}
                data-testid={`filter-${s}`}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s] ?? s}
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
            <div className="text-center py-8 text-gray-500">No support tickets found.</div>
          )}

          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-palop-blue hover:bg-blue-50/30 transition-all"
                onClick={() => setSelectedTicket(ticket)}
                data-testid={`ticket-row-${ticket.id}`}
              >
                <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-0.5 text-sm">{ticket.subject}</h4>
                    <div className="text-xs text-gray-500 space-x-2">
                      {ticket.name && <span>{ticket.name}</span>}
                      {ticket.email && <span>· {ticket.email}</span>}
                      {ticket.category && <span className="text-gray-400">· {ticket.category}</span>}
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

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.message}</p>

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{new Date(ticket.created_at).toLocaleString()}</span>
                  <span className="text-palop-blue text-xs font-medium">Click to open →</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ticket detail sheet */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => { if (!open) setSelectedTicket(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTicket && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-lg leading-snug pr-6">{selectedTicket.subject}</SheetTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {getPriorityBadge(selectedTicket.priority)}
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedTicket.status)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>
              </SheetHeader>

              {/* Customer info */}
              <div className="space-y-3 mb-6">
                {selectedTicket.name && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700">{selectedTicket.name}</span>
                  </div>
                )}
                {selectedTicket.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <a
                      href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(selectedTicket.subject)}`}
                      className="text-palop-blue hover:underline"
                    >
                      {selectedTicket.email}
                    </a>
                  </div>
                )}
                {selectedTicket.category && (
                  <div className="flex items-center gap-3 text-sm">
                    <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600 capitalize">{selectedTicket.category.replace(/_/g, ' ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Full message */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Status actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_ORDER.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selectedTicket.status === s ? 'default' : 'outline'}
                      disabled={updateStatus.isPending}
                      onClick={() => {
                        if (selectedTicket.status !== s) {
                          updateStatus.mutate({ id: selectedTicket.id, status: s });
                        }
                      }}
                      data-testid={`status-btn-${s}`}
                    >
                      {getStatusIcon(s)}
                      <span className="ml-1">{STATUS_LABELS[s]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedTicket.email && (
                <div className="mt-8">
                  <a
                    href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(selectedTicket.subject)}`}
                    className="w-full"
                  >
                    <Button className="w-full bg-palop-green hover:bg-palop-green/90 text-white">
                      <Mail className="h-4 w-4 mr-2" />
                      Reply by Email
                    </Button>
                  </a>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminSupportTickets;
