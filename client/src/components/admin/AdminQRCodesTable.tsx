
import { useState, useEffect } from "react";
import { useQRCodes, type QRCode } from "@/hooks/useQRCodes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  RefreshCw, 
  Eye, 
  Download, 
  RotateCcw,
  QrCode,
  Users,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeModal from "./QRCodeModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminQRCodesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredQRCodes, setFilteredQRCodes] = useState<QRCode[]>([]);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const { 
    qrCodes, 
    isLoading, 
    error, 
    refetch, 
    regenerateQR, 
    isRegenerating 
  } = useQRCodes();

  // Filter QR codes based on search term and status
  useEffect(() => {
    if (!qrCodes) {
      setFilteredQRCodes([]);
      return;
    }

    const filtered = qrCodes.filter((qrCode) => {
      const email = qrCode.profiles?.email || '';
      const planName = qrCode.orders?.plan_name || '';
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = (
        email.toLowerCase().includes(searchLower) ||
        planName.toLowerCase().includes(searchLower) ||
        qrCode.id.toLowerCase().includes(searchLower)
      );

      const matchesStatus = statusFilter === "all" || qrCode.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
    
    setFilteredQRCodes(filtered);
  }, [qrCodes, searchTerm, statusFilter]);

  const handleRefresh = () => {
    console.log('Refreshing QR codes...');
    refetch();
    toast({
      title: "QR codes refreshed",
      description: "QR code data has been updated.",
    });
  };

  const handleViewQRCode = (qrCode: QRCode) => {
    setSelectedQRCode(qrCode);
    setIsModalOpen(true);
  };

  const handleRegenerateQR = (qrCodeId: string) => {
    regenerateQR(qrCodeId);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      revoked: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Calculate overview statistics
  const totalCodes = qrCodes.length;
  const activeCodes = qrCodes.filter(qr => qr.status === 'active').length;
  const pendingCodes = qrCodes.filter(qr => qr.status === 'pending').length;
  const revokedCodes = qrCodes.filter(qr => qr.status === 'revoked').length;

  if (error) {
    console.error('Admin QR codes error:', error);
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error.message || "Failed to load QR codes. Please try again later."}
            </p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">{totalCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Codes</p>
                <p className="text-2xl font-bold text-green-600">{activeCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Activation</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revoked Codes</p>
                <p className="text-2xl font-bold text-red-600">{revokedCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>QR Codes Management ({filteredQRCodes.length} of {totalCodes})</CardTitle>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email, plan name, or QR code ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading QR codes...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QR Code ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Data Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQRCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" ? 'No QR codes found matching your filters.' : 'No QR codes found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQRCodes.map((qrCode) => (
                      <TableRow key={qrCode.id}>
                        <TableCell className="font-mono text-xs">
                          {qrCode.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {qrCode.profiles?.email || 'N/A'}
                        </TableCell>
                        <TableCell>{qrCode.orders?.plan_name || 'N/A'}</TableCell>
                        <TableCell>{qrCode.orders?.data_amount || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(qrCode.status)}</TableCell>
                        <TableCell>
                          {new Date(qrCode.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewQRCode(qrCode)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {qrCode.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRegenerateQR(qrCode.id)}
                                disabled={isRegenerating}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <QRCodeModal
        qrCode={selectedQRCode}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQRCode(null);
        }}
      />
    </div>
  );
};

export default AdminQRCodesTable;
