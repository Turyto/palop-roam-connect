
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, CheckCircle, AlertTriangle } from "lucide-react";

// Mock data for demonstration - will be replaced with real Supabase data
const mockTickets = [
  {
    id: "1",
    subject: "Unable to activate eSIM",
    user_email: "john@example.com",
    status: "open",
    priority: "high",
    created_at: "2024-01-15T10:30:00Z",
    message: "I've been trying to activate my eSIM for Cape Verde but the QR code isn't working...",
  },
  {
    id: "2",
    subject: "Billing question",
    user_email: "maria@example.com",
    status: "in_progress",
    priority: "medium",
    created_at: "2024-01-14T14:20:00Z",
    message: "I was charged twice for the same plan. Can you help me with a refund?",
  },
  {
    id: "3",
    subject: "Network coverage issue",
    user_email: "carlos@example.com",
    status: "resolved",
    priority: "low",
    created_at: "2024-01-13T09:15:00Z",
    message: "The network coverage in Luanda seems limited. Is this expected?",
  },
];

const AdminSupportTickets = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "destructive",
      in_progress: "secondary",
      resolved: "default",
      closed: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
      urgent: "destructive",
    };
    return <Badge variant={variants[priority] || "outline"}>{priority}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Support Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Development Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Support System Integration</h4>
              <p className="text-blue-800 text-sm mt-1">
                Support ticket system ready for implementation. Data shown below is mock data for demonstration.
              </p>
              <div className="mt-3 text-xs text-blue-700">
                <strong>Database Schema:</strong> support_tickets table created with RLS policies
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mockTickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h4>
                  <p className="text-sm text-gray-600">from {ticket.user_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(ticket.priority)}
                  <div className="flex items-center gap-1">
                    {getStatusIcon(ticket.status)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-3">{ticket.message}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {mockTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No support tickets found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSupportTickets;
