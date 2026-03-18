
import ESIMActivationModal from "./ESIMActivationModal";

interface QRCodeDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activationUrl: string;
  orderId: string;
  planName?: string;
  dataAmount?: string;
  status: 'pending' | 'active' | 'revoked';
  activationCode?: string;
  iccid?: string;
  coverage?: string;
}

const QRCodeDownloadModal = ({
  isOpen,
  onClose,
  activationUrl,
  orderId,
  planName,
  dataAmount,
  status,
  activationCode,
  iccid,
  coverage,
}: QRCodeDownloadModalProps) => {
  return (
    <ESIMActivationModal
      isOpen={isOpen}
      onClose={onClose}
      activationUrl={activationUrl}
      orderId={orderId}
      planName={planName}
      dataAmount={dataAmount}
      status={status}
      activationCode={activationCode}
      iccid={iccid}
      coverage={coverage}
    />
  );
};

export default QRCodeDownloadModal;
