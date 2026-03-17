
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Download, ExternalLink, Smartphone, Copy, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { ESIMPlan } from "@/pages/Purchase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface ConfirmationViewProps {
  plan: ESIMPlan;
  orderId: string | null;
  guestEmail?: string;
  onBackToPlans: () => void;
}

const ConfirmationView = ({ plan, orderId, guestEmail, onBackToPlans }: ConfirmationViewProps) => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);

  const { data: qrData } = useQuery({
    queryKey: ["confirmation-qr", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();
      return data;
    },
    enabled: !!orderId,
    refetchInterval: (query) => (query.state.data ? false : 3000),
    retry: 5,
  });

  const { data: activationData } = useQuery({
    queryKey: ["confirmation-activation", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data } = await supabase
        .from("esim_activations")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();
      return data;
    },
    enabled: !!orderId,
    retry: 3,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Activation code copied to clipboard." });
  };

  const handleCreateAccount = async () => {
    if (!guestEmail || !password) return;
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Please use at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsSavingAccount(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: guestEmail, password });
      if (error) {
        toast({ title: "Could not create account", description: error.message, variant: "destructive" });
      } else {
        setAccountSaved(true);
        toast({ title: "Account created!", description: "Your account is ready. You can now sign in anytime to manage your eSIMs." });
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const hasQR = qrData || activationData;

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
        <p className="text-gray-600">
          Your eSIM is ready. Scan the QR code below or use the activation link.
        </p>
        {orderId && (
          <p className="text-xs text-gray-400 mt-2">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}
      </div>

      {/* Guest magic-link notice */}
      {guestEmail && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Check your inbox</p>
            <p>
              We've emailed a secure link to <strong>{guestEmail}</strong>. Click it anytime to access your eSIM and order history — no password needed.
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3 text-center">Order Summary</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{plan.name} Plan</p>
            <p className="text-gray-600 text-sm">{plan.data} · {plan.days} days</p>
          </div>
          <p className="font-bold text-lg">{plan.price.toFixed(2)} {plan.currency}</p>
        </div>
      </div>

      {hasQR ? (
        <div className="mb-6 space-y-4">
          <h3 className="font-semibold text-center">Your eSIM Activation</h3>

          {qrData?.qr_image_url && (
            <div className="flex justify-center">
              <div className="border-2 border-palop-green rounded-lg p-3 inline-block">
                <img
                  src={qrData.qr_image_url}
                  alt="eSIM QR Code"
                  className="w-48 h-48 object-contain"
                  data-testid="img-qr-code"
                />
              </div>
            </div>
          )}

          {(activationData?.activation_code || qrData?.activation_url) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">LPA Activation Code</p>
              <div className="flex items-center gap-2">
                <code
                  className="text-xs break-all flex-1 text-gray-700"
                  data-testid="text-activation-code"
                >
                  {activationData?.activation_code || qrData?.activation_url}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(activationData?.activation_code || qrData?.activation_url || "")}
                  data-testid="button-copy-activation"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {activationData?.activation_url && (
            <a
              href={activationData.activation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-palop-blue hover:underline text-sm"
              data-testid="link-activation-url"
            >
              <ExternalLink className="h-4 w-4" />
              Open activation page
            </a>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">How to install your eSIM</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Settings → Cellular / Mobile Data</li>
                  <li>Tap "Add eSIM" or "Add Data Plan"</li>
                  <li>Scan the QR code or enter the LPA code manually</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-center text-sm text-yellow-700">
          <p className="font-semibold mb-1">eSIM provisioning in progress</p>
          <p>Your QR code will appear here shortly. You can also check your <Link to="/orders" className="underline font-medium">orders page</Link> anytime.</p>
        </div>
      )}

      {/* Create account prompt for guests */}
      {guestEmail && !accountSaved && (
        <div className="border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-800">Save your account to manage future eSIMs</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Your email <strong>{guestEmail}</strong> is already set. Just add a password to create your account.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="create-password" className="text-sm">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="create-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-create-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              onClick={handleCreateAccount}
              disabled={isSavingAccount || !password}
              className="w-full bg-palop-green hover:bg-palop-green/90"
              data-testid="button-create-account"
            >
              {isSavingAccount ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </div>
      )}

      {guestEmail && accountSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-medium">Account created! You can now sign in anytime at <Link to="/auth" className="underline">buechama.com</Link>.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onBackToPlans}
          data-testid="button-buy-another"
        >
          Buy Another eSIM
        </Button>
        <Link to="/orders" className="flex-1">
          <Button
            className="w-full bg-palop-green hover:bg-palop-green/90"
            data-testid="button-view-orders"
          >
            <Download className="h-4 w-4 mr-2" />
            View My Orders
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationView;
