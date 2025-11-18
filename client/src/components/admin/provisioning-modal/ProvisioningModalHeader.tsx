
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";

const ProvisioningModalHeader = () => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <RefreshCw className="h-5 w-5" />
        eSIM Provisioning Details
      </DialogTitle>
    </DialogHeader>
  );
};

export default ProvisioningModalHeader;
