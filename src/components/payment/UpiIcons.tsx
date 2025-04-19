
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UpiIconsProps {
  className?: string;
}

const UPI_APPS = [
  {
    name: "Google Pay",
    icon: "/assets/payment-icons/googlepay.svg",
    fallback: "GPay"
  },
  {
    name: "PhonePe", 
    icon: "/assets/payment-icons/phonepe.svg",
    fallback: "PhonePe"
  },
  {
    name: "PayTM",
    icon: "/assets/payment-icons/paytm.svg",
    fallback: "Paytm"
  },
  {
    name: "BHIM UPI",
    icon: "/assets/payment-icons/bhim.svg",
    fallback: "BHIM"
  },
  {
    name: "Amazon Pay",
    icon: "/assets/payment-icons/amazonpay.svg",
    fallback: "Amazon"
  },
  {
    name: "Other UPI Apps",
    icon: "/assets/payment-icons/upi.svg",
    fallback: "UPI"
  }
];

const UpiIcons: React.FC<UpiIconsProps> = ({ className = "" }) => {
  const [missingIcons, setMissingIcons] = React.useState<string[]>([]);

  // Track missing icons for reporting
  const handleImageError = (appName: string) => {
    setMissingIcons(prev => [...prev, appName]);
    console.warn(`UPI icon missing: ${appName}`);
  };

  return (
    <div className={`mt-4 ${className}`}>
      <h3 className="text-center text-sm font-medium mb-3">Pay using any UPI app</h3>
      
      {/* Show warning if any icons are missing */}
      {missingIcons.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3 flex gap-2 items-center text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs">
            Some payment icons could not be loaded. This doesn't affect payment functionality.
          </span>
        </div>
      )}
      
      <div className="upi-payment-icons grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        {UPI_APPS.map((app) => (
          <div key={app.name} className="flex flex-col items-center">
            <div className="upi-icon w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white rounded-lg shadow-sm p-2">
              <img 
                src={app.icon} 
                alt={`Pay with ${app.name}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Create fallback content on error
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentNode as HTMLElement;
                  // Add fallback div with app name
                  if (parent) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = "upi-icon-fallback text-center font-medium text-sm";
                    fallbackDiv.textContent = app.fallback;
                    parent.appendChild(fallbackDiv);
                  }
                  handleImageError(app.name);
                }}
              />
            </div>
            <span className="upi-icon-label text-xs mt-1 text-center">{app.name}</span>
          </div>
        ))}
      </div>
      
      <p className="text-center text-xs text-gray-500 mt-4">
        After payment, copy your UTR/transaction number from your UPI app and paste it above.
      </p>
    </div>
  );
};

export default UpiIcons;
