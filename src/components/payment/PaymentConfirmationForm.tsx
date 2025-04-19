
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface PaymentConfirmationFormProps {
  userUpiId: string;
  utrId: string;
  isProcessing: boolean;
  onUpiIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUtrChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export const PaymentConfirmationForm: React.FC<PaymentConfirmationFormProps> = ({
  userUpiId,
  utrId,
  isProcessing,
  onUpiIdChange,
  onUtrChange,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="userUpiId" className="mb-1">Your UPI ID</Label>
        <Input
          id="userUpiId"
          name="userUpiId"
          type="text"
          value={userUpiId}
          onChange={onUpiIdChange}
          placeholder="YourName@bank"
          required
          disabled={isProcessing}
          aria-label="Your UPI ID used for payment"
          autoComplete="off"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter your UPI ID that you used to make the payment
        </p>
      </div>

      <div>
        <Label htmlFor="utrId" className="mb-1">UTR/Transaction Reference Number</Label>
        <Input
          id="utrId" 
          name="utrId"
          type="text"
          value={utrId}
          onChange={onUtrChange}
          placeholder="Enter 12-digit UTR number"
          required
          disabled={isProcessing}
          aria-label="UTR/Transaction Reference Number"
          autoComplete="off"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can find this in your UPI app transaction history
        </p>
      </div>

      <Button
        onClick={onSubmit}
        disabled={isProcessing || !userUpiId || !utrId}
        className="w-full"
        aria-label="Submit payment details"
        type="button"
        id="confirm-payment-details"
        name="confirm-payment-details"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Confirm Payment"
        )}
      </Button>
    </div>
  );
};
