
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeSectionProps {
  upiPaymentLink: string;
}

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({ upiPaymentLink }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="border-2 border-gray-200 p-3 rounded-lg mb-2">
        <QRCodeSVG 
          value={upiPaymentLink} 
          size={150} 
          level="H" 
          includeMargin={true}
          className="mx-auto" 
        />
      </div>
      <p className="text-xs text-gray-500 text-center">Scan QR with your UPI app</p>
    </div>
  );
};
