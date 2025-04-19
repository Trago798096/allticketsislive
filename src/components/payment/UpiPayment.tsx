
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { UpiAppIcon } from "./UpiAppIcon";
import { QRCodeSection } from "./QRCodeSection";
import { UpiIdDisplay } from "./UpiIdDisplay";
import { PaymentConfirmationForm } from "./PaymentConfirmationForm";

interface UpiPaymentProps {
  amount: number;
  onUtrSubmit: (utrId: string, userUpiId: string) => void;
  isProcessing: boolean;
  upiId?: string;
  onUpiIdChange?: (value: string) => void;
  utrNumber?: string;
  onUtrNumberChange?: (value: string) => void;
}

export function UpiPayment({ 
  amount, 
  onUtrSubmit, 
  isProcessing, 
  upiId = 'ipltickets@ybl', 
  onUpiIdChange,
  utrNumber = '',
  onUtrNumberChange
}: UpiPaymentProps) {
  const [userUpiId, setUserUpiId] = useState<string>(upiId || '');
  const [utrId, setUtrId] = useState<string>(utrNumber || '');
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  
  useEffect(() => {
    if (upiId !== undefined) setUserUpiId(upiId);
  }, [upiId]);
  
  useEffect(() => {
    if (utrNumber !== undefined) setUtrId(utrNumber);
  }, [utrNumber]);
  
  const upiPaymentLink = `upi://pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`;
  
  const handleUpiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserUpiId(value);
    if (onUpiIdChange) onUpiIdChange(value);
  };

  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUtrId(value);
    if (onUtrNumberChange) onUtrNumberChange(value);
  };
  
  const handleSubmit = () => {
    if (!utrId.trim()) {
      toast.error("Please enter UTR/Transaction ID");
      return;
    }
    
    if (!userUpiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }
    
    onUtrSubmit(utrId, userUpiId);
  };
  
  // Using absolute paths for payment icons
  const upiApps = [
    {
      name: 'Google Pay',
      icon: '/assets/payment-icons/gpay-new.svg',
      fallback: 'GPay',
      deepLink: `gpay://upi/pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`
    },
    {
      name: 'Paytm',
      icon: '/assets/payment-icons/paytm-new.svg',
      fallback: 'Paytm',
      deepLink: `paytmmp://upi/pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`
    },
    {
      name: 'BHIM',
      icon: '/assets/payment-icons/bhim-new.svg',
      fallback: 'BHIM',
      deepLink: `bhim://upi/pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`
    },
    {
      name: 'Amazon Pay',
      icon: '/assets/payment-icons/amazonpay-new.svg',
      fallback: 'Amazon',
      deepLink: `amazonpay://upi/pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`
    }
  ];
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-2">Complete Your Payment</h3>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            <QRCodeSection upiPaymentLink={upiPaymentLink} />
            
            <div className="flex-1 space-y-4 w-full">
              <UpiIdDisplay upiId={upiId} />
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Amount</h4>
                <div className="bg-gray-50 px-3 py-2 rounded-md">
                  <span className="text-xl font-medium">₹{amount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="mb-3">
                  <h4 className="text-base font-medium text-gray-800">Pay using UPI Apps</h4>
                  <p className="text-sm text-gray-500">Choose your preferred payment method</p>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {upiApps.map(app => (
                    <UpiAppIcon
                      key={app.name}
                      name={app.name}
                      icon={app.icon}
                      fallback={app.fallback}
                      deepLink={app.deepLink}
                      onClick={() => {
                        toast.info(`Opening ${app.name}...`);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {!hasPaid ? (
        <Button 
          onClick={() => setHasPaid(true)} 
          className="w-full mt-4 bg-gradient-to-r from-[#ea384c] to-[#c62828] text-white"
          aria-label="I've made the payment"
          name="confirm-payment"
          id="confirm-payment-btn"
        >
          I've Made the Payment
        </Button>
      ) : (
        <div className="space-y-4 mt-6 border-t pt-6">
          <h4 className="font-medium">Confirm Payment Details</h4>
          <PaymentConfirmationForm
            userUpiId={userUpiId}
            utrId={utrId}
            isProcessing={isProcessing}
            onUpiIdChange={handleUpiIdChange}
            onUtrChange={handleUtrChange}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
