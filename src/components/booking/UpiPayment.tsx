
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Clipboard, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import QRCode from 'qrcode.react';
import { UpiAppIcon } from "@/components/payment/UpiAppIcon";
import { getPublicUrl } from "@/utils/storageUtils";

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
  const [upiAppsOpen, setUpiAppsOpen] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  
  useEffect(() => {
    if (upiId !== undefined) setUserUpiId(upiId);
  }, [upiId]);
  
  useEffect(() => {
    if (utrNumber !== undefined) setUtrId(utrNumber);
  }, [utrNumber]);
  
  const upiPaymentLink = `upi://pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`;
  
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
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
  
  const upiApps = [
    {
      name: 'Google Pay',
      icon: getPublicUrl('logos', 'payment-icons/gpay.svg'),
      fallback: 'GPay',
      deepLink: `gpay://upi/pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`
    },
    {
      name: 'Paytm',
      icon: getPublicUrl('logos', 'payment-icons/paytm.svg'),
      fallback: 'Paytm',
      deepLink: `paytmmp://pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`
    },
    {
      name: 'BHIM',
      icon: getPublicUrl('logos', 'payment-icons/bhimpay.png'),
      fallback: 'BHIM',
      deepLink: `bhim://pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`
    },
    {
      name: 'Amazon Pay',
      icon: getPublicUrl('logos', 'payment-icons/amazonpay.svg'),
      fallback: 'Amazon',
      deepLink: `amazonpay://pay?pa=${upiId}&am=${amount}&tn=IPL%20Ticket%20Booking&cu=INR`
    }
  ];
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-2">Complete Your Payment</h3>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            <div className="flex flex-col items-center">
              <div className="bg-white p-3 rounded-lg shadow-sm border mb-2">
                <QRCode 
                  value={upiPaymentLink}
                  size={160}
                  renderAs="svg"
                  includeMargin={true}
                  level="H"
                />
              </div>
              <span className="text-sm text-gray-500">Scan with any UPI app</span>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Pay to UPI ID</h4>
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md">
                  <span className="text-lg font-mono flex-1 overflow-x-auto">{upiId}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyUpiId}
                    className="ml-2 shrink-0"
                    aria-label="Copy UPI ID"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
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
        >
          I've Made the Payment
        </Button>
      ) : (
        <div className="space-y-4 mt-6 border-t pt-6">
          <h4 className="font-medium">Confirm Payment Details</h4>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="user-upi">Your UPI ID</Label>
              <Input
                id="user-upi"
                name="user-upi"
                value={userUpiId}
                onChange={handleUpiIdChange}
                placeholder="yourname@upi"
                disabled={isProcessing}
                required
                autoComplete="off"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="utr">UTR / Transaction ID</Label>
              <Input
                id="utr"
                name="utr"
                value={utrId}
                onChange={handleUtrChange}
                placeholder="Enter UTR number from payment confirmation"
                disabled={isProcessing}
                required
                autoComplete="off"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can find this in your payment app transaction history
              </p>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="w-full bg-[#ea384c] hover:bg-[#c62828] text-white"
              disabled={isProcessing}
              aria-label="Confirm booking"
            >
              {isProcessing ? (
                <>Processing</>
              ) : (
                <>Confirm Booking</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
