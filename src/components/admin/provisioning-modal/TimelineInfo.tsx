
import type { ESIMActivation } from "@/types/esimActivations";

interface TimelineInfoProps {
  activation: ESIMActivation;
}

const TimelineInfo = ({ activation }: TimelineInfoProps) => {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="text-sm font-medium text-gray-600">Created</label>
          <div className="text-gray-900">
            {new Date(activation.created_at).toLocaleString()}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Last Updated</label>
          <div className="text-gray-900">
            {new Date(activation.updated_at).toLocaleString()}
          </div>
        </div>
        {activation.activated_at && (
          <div>
            <label className="text-sm font-medium text-gray-600">Activated</label>
            <div className="text-gray-900">
              {new Date(activation.activated_at).toLocaleString()}
            </div>
          </div>
        )}
        {activation.delivered_at && (
          <div>
            <label className="text-sm font-medium text-gray-600">Delivered</label>
            <div className="text-gray-900">
              {new Date(activation.delivered_at).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineInfo;
