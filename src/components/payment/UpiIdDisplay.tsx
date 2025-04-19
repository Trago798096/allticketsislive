
import React from 'react';
import { ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';

interface UpiIdDisplayProps {
  upiId: string;
}

export const UpiIdDisplay: React.FC<UpiIdDisplayProps> = ({ upiId }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId)
      .then(() => toast.success("UPI ID copied to clipboard"))
      .catch(() => toast.error("Failed to copy UPI ID"));
  };

  return (
    <div>
      <h4 className="font-medium text-gray-700 mb-1">UPI ID</h4>
      <div className="flex items-center gap-2">
        <div className="bg-gray-50 flex-1 px-3 py-2 rounded-md font-medium">
          {upiId}
        </div>
        <button
          className="p-2 rounded-md hover:bg-gray-100"
          onClick={copyToClipboard}
          type="button"
          aria-label="Copy UPI ID"
        >
          <ClipboardCopy className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};
