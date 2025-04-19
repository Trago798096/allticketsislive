
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Info, AlertTriangle } from "lucide-react";
import { PaymentIcons } from "@/components/payment/PaymentIcons";

interface BookingPaymentProps {
  utrValue: string;
  handleUtrChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalPrice: number;
  sectionName: string;
  selectedTickets: number;
  isSubmitting: boolean;
  matchDetails?: {
    team1Name?: string;
    team2Name?: string;
    venue?: string;
    date?: string;
  };
}

export const BookingPayment: React.FC<BookingPaymentProps> = ({
  utrValue,
  handleUtrChange,
  totalPrice,
  sectionName,
  selectedTickets,
  isSubmitting,
  matchDetails,
}) => {
  // Function to handle opening the UTR help popup
  const openUtrHelp = () => {
    window.open('https://help.paytm.com/s/article/what-is-utr-number', '_blank');
  };
  
  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      {matchDetails && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Match Details</h3>
          <p className="text-gray-700">{matchDetails.team1Name || 'Team 1'} vs {matchDetails.team2Name || 'Team 2'}</p>
          {matchDetails.venue && <p className="text-gray-600 text-sm">{matchDetails.venue}</p>}
          {matchDetails.date && <p className="text-gray-600 text-sm">{matchDetails.date}</p>}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="booking-utr" className="text-base font-medium">UTR Number (Transaction ID)</Label>
          <div className="relative group">
            <Info className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
              UTR (Unique Transaction Reference) is a number assigned to every transaction in the banking system
            </div>
          </div>
        </div>
        <a 
          href="#utr-help" 
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          onClick={(e) => {
            e.preventDefault();
            openUtrHelp();
          }}
        >
          <Info className="h-4 w-4" />
          <span>How to find UTR?</span>
        </a>
      </div>
      
      <Input 
        id="booking-utr" 
        name="booking_utr" 
        value={utrValue} 
        onChange={handleUtrChange} 
        required 
        placeholder="Enter UTR/Transaction Reference Number"
        autoComplete="off"
        aria-label="UTR Transaction Number"
        aria-required="true"
        className="mb-2"
      />
      
      <div className="flex items-center gap-2 text-amber-600 mb-4">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-xs">
          Please pay ₹{totalPrice} to UPI ID: <strong>ipltickets@ybl</strong> and enter the UTR number here.
        </p>
      </div>
      
      <PaymentIcons />
      
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">
              Section: <span className="font-medium">{sectionName || "None selected"}</span>
            </p>
            <p className="text-gray-600">
              Tickets: <span className="font-medium">{selectedTickets}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold">₹{totalPrice}</p>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-6" 
          disabled={isSubmitting || !utrValue.trim()}
          id="submit-booking"
          name="submit_booking"
          aria-label="Book Tickets"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Book Tickets"
          )}
        </Button>
      </div>
    </div>
  );
};
