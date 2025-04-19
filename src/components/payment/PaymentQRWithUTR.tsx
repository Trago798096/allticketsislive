
import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentQRWithUTRProps {
  matchId: string;
  amount: number;
  userEmail: string;
  onPaymentComplete?: (utrNumber: string) => void;
}

export function PaymentQRWithUTR({ matchId, amount, userEmail, onPaymentComplete }: PaymentQRWithUTRProps) {
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UPI Details
  const upiId = 'iplbooking@ybl';
  const payeeName = 'IPL Ticket Booking';
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

  const validateUTR = (utr: string) => {
    const utrRegex = /^[0-9]{12,}$/;
    return utrRegex.test(utr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUTR(utrNumber)) {
      toast.error('Please enter a valid 12-digit UTR number');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            match_id: matchId,
            user_email: userEmail,
            amount: amount,
            utr_number: utrNumber,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Payment details submitted successfully');
      onPaymentComplete?.(utrNumber);
      setUtrNumber('');
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      toast.error(error.message || 'Failed to submit payment details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Scan QR Code to Pay</h3>
          <p className="text-sm text-gray-500">Amount: ₹{amount.toFixed(2)}</p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
            <QRCode 
              value={upiLink}
              size={180}
              level="H"
              includeMargin={true}
              renderAs="svg"
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">UPI ID: {upiId}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="utr">UTR Number</Label>
            <Input
              id="utr"
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="Enter 12-digit UTR number"
              required
              pattern="[0-9]{12,}"
              title="Please enter a valid UTR number (minimum 12 digits)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Please enter the UTR (Transaction Reference Number) from your payment confirmation
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit UTR'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
