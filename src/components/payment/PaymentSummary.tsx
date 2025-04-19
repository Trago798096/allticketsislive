
import { Separator } from "@/components/ui/separator";

interface PaymentSummaryProps {
  bookingData: {
    ticketPrice?: number;
    quantity?: number;
    convenienceFee?: number;
    totalAmount?: number;
  };
  isSubmitting: boolean;
  paymentMethod: string;
  upiId: string;
  utrNumber: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const PaymentSummary = ({ 
  bookingData, 
  isSubmitting, 
  paymentMethod,
  upiId,
  utrNumber,
  onSubmit 
}: PaymentSummaryProps) => {
  // Calculate convenience fee (3% of ticket price)
  const ticketPrice = bookingData?.ticketPrice || 0;
  const quantity = bookingData?.quantity || 0;
  const convenienceFee = bookingData?.convenienceFee || Math.round(ticketPrice * quantity * 0.03);
  const totalAmount = bookingData?.totalAmount || (ticketPrice * quantity + convenienceFee);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
      <h3 className="font-medium mb-4">Order Summary</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Ticket Price</span>
          <span>₹{ticketPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Quantity</span>
          <span>{quantity}</span>
        </div>
        <div className="flex justify-between">
          <span>Convenience Fee</span>
          <span>₹{convenienceFee.toLocaleString()}</span>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between font-bold">
          <span>Total Amount</span>
          <span>₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>
      
      {paymentMethod && (
        <div className="mt-6">
          <button 
            className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSubmit}
            disabled={isSubmitting || !upiId || !utrNumber}
            type="button"
            id="complete-payment-btn"
            name="complete-payment"
            aria-label="Complete payment"
          >
            {isSubmitting ? "Processing..." : "Complete Payment"}
          </button>
          
          <div className="text-xs text-center mt-3 text-gray-500">
            By clicking, you agree to our terms and privacy policy
          </div>
        </div>
      )}
    </div>
  );
};
