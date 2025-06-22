
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";

const DeviceCompatibilityChecker = () => {
  const [deviceInfo, setDeviceInfo] = useState<{
    userAgent: string;
    platform: string;
    isIOS: boolean;
    isAndroid: boolean;
    isDesktop: boolean;
    estimatedDevice: string;
    esimSupport: 'supported' | 'unsupported' | 'unknown';
  } | null>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;
    
    let estimatedDevice = 'Unknown Device';
    let esimSupport: 'supported' | 'unsupported' | 'unknown' = 'unknown';
    
    if (isIOS) {
      if (userAgent.includes('iPhone')) {
        estimatedDevice = 'iPhone';
        // iPhone XS and later support eSIM
        const iPhoneModel = userAgent.match(/iPhone OS (\d+)_/);
        if (iPhoneModel && parseInt(iPhoneModel[1]) >= 12) {
          esimSupport = 'supported';
        } else {
          esimSupport = 'unsupported';
        }
      } else if (userAgent.includes('iPad')) {
        estimatedDevice = 'iPad';
        // iPad Pro 2018 and later, iPad Air 2019 and later support eSIM
        esimSupport = 'supported';
      }
    } else if (isAndroid) {
      estimatedDevice = 'Android Device';
      // Most Android 9+ devices support eSIM, but varies by manufacturer
      esimSupport = 'unknown';
    } else {
      estimatedDevice = 'Desktop/Laptop';
      esimSupport = 'unsupported';
    }

    setDeviceInfo({
      userAgent,
      platform,
      isIOS,
      isAndroid,
      isDesktop,
      estimatedDevice,
      esimSupport
    });
  }, []);

  if (!deviceInfo) return null;

  const getCompatibilityIcon = () => {
    switch (deviceInfo.esimSupport) {
      case 'supported':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'unsupported':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getCompatibilityBadge = () => {
    switch (deviceInfo.esimSupport) {
      case 'supported':
        return <Badge className="bg-green-100 text-green-800">✅ Compatible</Badge>;
      case 'unsupported':
        return <Badge variant="destructive">❌ Not Compatible</Badge>;
      default:
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">⚠️ Check Required</Badge>;
    }
  };

  const getCompatibilityMessage = () => {
    if (deviceInfo.isDesktop) {
      return "eSIMs are for mobile devices only. Please check compatibility on your phone or tablet.";
    }
    
    switch (deviceInfo.esimSupport) {
      case 'supported':
        return "Great! Your device supports eSIM technology. You can proceed with confidence.";
      case 'unsupported':
        return "Your device doesn't support eSIM. Consider upgrading to a newer model or use a physical SIM card.";
      default:
        return "Please check your device settings to confirm eSIM support, or contact our support team.";
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          Device Compatibility
          {getCompatibilityBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Detected Device:</span>
            <div className="text-gray-600">{deviceInfo.estimatedDevice}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Platform:</span>
            <div className="text-gray-600">{deviceInfo.platform}</div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {getCompatibilityMessage()}
          </AlertDescription>
        </Alert>

        {deviceInfo.esimSupport === 'unknown' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <div className="font-medium">How to check eSIM support:</div>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Go to Settings → Cellular/Mobile Data</li>
                <li>• Look for "Add Cellular Plan" or "Add eSIM"</li>
                <li>• If available, your device supports eSIM</li>
              </ul>
            </div>
          </div>
        )}

        {deviceInfo.esimSupport === 'supported' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-800">
              <div className="font-medium">🎉 You're all set!</div>
              <div className="mt-1">
                Your device is fully compatible with our eSIM service. Order with confidence!
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceCompatibilityChecker;
