
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { RedBookMyShowLogo } from "@/components/ui/cricket-icons";

interface BookingSummaryProps {
  summaryId: string;
  selectedSeats: number;
  totalPrice: number;
  sectionName: string;
  onContinue: () => void;
  isDisabled: boolean;
  matchDetails?: {
    team1Name?: string;
    team2Name?: string;
    venue?: string;
    date?: string;
  };
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  summaryId,
  selectedSeats,
  totalPrice,
  sectionName,
  onContinue,
  isDisabled,
  matchDetails,
}) => {
  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <RedBookMyShowLogo className="h-8 w-auto" />
          </div>
          
          <h2 className="font-bold text-lg" id={summaryId}>
            Booking Summary
          </h2>

          <div className="space-y-2">
            {matchDetails && (
              <>
                {matchDetails.team1Name && matchDetails.team2Name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Match</span>
                    <span className="text-sm font-medium truncate max-w-[180px] text-right">
                      {matchDetails.team1Name} vs {matchDetails.team2Name}
                    </span>
                  </div>
                )}
                
                {matchDetails.venue && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Venue</span>
                    <span className="text-sm truncate max-w-[180px] text-right">
                      {matchDetails.venue}
                    </span>
                  </div>
                )}
                
                {matchDetails.date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date</span>
                    <span className="text-sm">{matchDetails.date}</span>
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tickets</span>
              <span className="text-sm">{selectedSeats} × Ticket(s)</span>
            </div>
            
            {sectionName && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Section</span>
                <span className="text-sm">{sectionName}</span>
              </div>
            )}
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onContinue}
            className="w-full bg-[#ea384c] hover:bg-[#c62828] text-white transition-colors"
            disabled={isDisabled}
            id="continue-booking"
            name="continue-booking"
          >
            Continue to Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Secure payment powered by UPI
            </p>
          </div>
          
          {/* Trust badges */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <ShieldCheck className="h-4 w-4 mr-2 text-[#ea384c]" />
              <span>100% Verified Transactions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
