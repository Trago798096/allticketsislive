
import React from 'react';
import { Icons } from "@/components/ui/icons";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  selectedMethod, 
  onMethodChange 
}) => {
  const paymentMethods = [
    { id: "upi", label: "UPI", icon: "upi" },
    { id: "card", label: "Credit/Debit Card", icon: "creditCard" },
    { id: "netbanking", label: "Net Banking", icon: "bank" }
  ];
  
  return (
    <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => onMethodChange(method.id)}
          type="button"
          className={`px-4 py-2 border rounded-lg flex items-center space-x-2 min-w-[120px] transition-colors ${
            selectedMethod === method.id
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:bg-gray-50"
          }`}
          aria-pressed={selectedMethod === method.id}
          aria-label={`Pay with ${method.label}`}
        >
          {Icons[method.icon as keyof typeof Icons] && (
            React.createElement(Icons[method.icon as keyof typeof Icons], { className: "h-5 w-5" })
          )}
          <span>{method.label}</span>
        </button>
      ))}
    </div>
  );
};
