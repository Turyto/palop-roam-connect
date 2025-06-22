
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Eye, Copy, QrCode, Mail, Zap, FileText } from "lucide-react";

interface OrderActionsProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  onDownloadESIM: (order: any) => void;
  onResendEmail: (orderId: string) => void;
  onTopUp?: (order: any) => void;
  variant?: 'compact' | 'expanded';
}

const OrderActions = ({ 
  order, 
  qrCode, 
  canDownload, 
  onDownloadESIM, 
  onResendEmail,
  onTopUp,
  variant = 'compact'
}: OrderActionsProps) => {
  console.log('🎬 OrderActions render:', { 
    orderId: order.id,
    canDownload, 
    variant, 
    hasQRCode: !!qrCode 
  });

  // Check if order is eligible for top-up (completed orders only)
  const canTopUp = order.status === 'completed' && order.payment_status === 'succeeded';

  const handleDownloadReceipt = () => {
    // Mock receipt download
    console.log('Download receipt for order:', order.id);
    // In a real implementation, this would generate and download a PDF receipt
  };

  // Always render the component, but show different content based on canDownload
  if (variant === 'compact') {
    if (canDownload) {
      console.log('✅ Rendering COMPACT download section for order:', order.id);
      return (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900">eSIM Ready for Download</h4>
              <p className="text-sm text-blue-700">Your eSIM is ready to install on your device</p>
              <p className="text-xs text-blue-600 mt-1">💡 For your safety, do not share this QR with others</p>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownloadESIM(order)}
                      className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View QR Code
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View your eSIM QR code for installation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button 
                onClick={() => onDownloadESIM(order)}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download eSIM
              </Button>
              
              {canTopUp && onTopUp && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => onTopUp(order)}
                        className="bg-palop-green hover:bg-palop-green/90 text-white"
                        size="sm"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Top-Up
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add more data or extend validity</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      );
    } else if (canTopUp && onTopUp) {
      console.log('🔄 Rendering COMPACT top-up only section for order:', order.id);
      return (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-900">Add More Data or Time</h4>
              <p className="text-sm text-green-700">Extend your plan with additional data or validity</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => onTopUp(order)}
                    className="bg-palop-green hover:bg-palop-green/90 text-white"
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Top-Up Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add more data or extend validity</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      );
    } else {
      console.log('❌ Cannot download or top-up - not rendering compact actions for order:', order.id);
      return null;
    }
  }

  if (canDownload || canTopUp) {
    console.log('✅ Rendering EXPANDED actions section for order:', order.id);
    return (
      <div className="bg-green-50 p-3 rounded-lg">
        <h4 className="font-medium text-sm mb-2 text-green-800">eSIM Actions</h4>
        <div className="flex flex-wrap gap-2">
          {canDownload && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownloadESIM(order)}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Show QR Code
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Display QR code for eSIM installation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownloadESIM(order)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Activation URL
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy activation URL to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onResendEmail(order.id)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Email
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Resend eSIM details to your email</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadReceipt}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download purchase receipt (PDF)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
          {canTopUp && onTopUp && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onTopUp(order)}
                    className="bg-palop-green/10 hover:bg-palop-green/20 border-palop-green text-palop-green"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Top-Up Plan
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add more data or extend validity</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  }

  console.log('❌ Cannot download or top-up - not rendering expanded actions for order:', order.id);
  return null;
};

export default OrderActions;
