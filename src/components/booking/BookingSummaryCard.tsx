
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookingSummaryCardProps {
  selectedSeats: number;
  totalPrice: number;
  sectionName?: string;
  onContinue: () => void;
  isDisabled: boolean;
  summaryId?: string; // Added summaryId prop
}

export const BookingSummaryCard = ({
  selectedSeats,
  totalPrice,
  sectionName,
  onContinue,
  isDisabled,
  summaryId
}: BookingSummaryCardProps) => {
  return (
    <Card>
      <CardContent className="p-6" id={summaryId}>
        <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Tickets</span>
            <span className="font-medium">{selectedSeats}</span>
          </div>
          
          {sectionName && (
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Section</span>
              <span className="font-medium">{sectionName}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <span className="font-medium">Total Price</span>
            <span className="text-lg font-bold">₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <Button 
          onClick={onContinue} 
          className="w-full mt-6 bg-gradient-to-r from-ipl-purple to-ipl-blue hover:opacity-90"
          disabled={isDisabled}
        >
          Continue to Payment
        </Button>
      </CardContent>
    </Card>
  );
};
