
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatCategorySelector } from "./SeatCategorySelector";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SeatCategoryCardProps {
  matchId: string;
  team1Name: string;
  team2Name: string;
  sections: Array<{
    id: string;
    name: string;
    category?: string;
    color?: string;
    price: number;
    available: number;
  }>;
  selectedSection: string | null;
  selectedSeats: number;
  onSectionChange: (sectionId: string) => void;
  onSeatsChange: (count: number) => void;
  onCategoryChange: (categoryData: {
    sectionId: string;
    price: number;
    quantity: number;
    totalPrice: number;
    sectionName: string;
  }) => void;
  onContinue: () => void;
  isDisabled?: boolean;
}

export const SeatCategoryCard: React.FC<SeatCategoryCardProps> = ({
  matchId,
  team1Name,
  team2Name,
  sections,
  selectedSection,
  selectedSeats,
  onSectionChange,
  onSeatsChange,
  onCategoryChange,
  onContinue,
  isDisabled = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl" id="category-selection-title">Choose Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h2 className="font-semibold">{team1Name || 'Team 1'} vs {team2Name || 'Team 2'}</h2>
        </div>
        
        <SeatCategorySelector
          matchId={matchId}
          sections={sections || []}
          selectedSection={selectedSection || ""}
          selectedSeats={selectedSeats}
          onSectionChange={onSectionChange}
          onSeatsChange={onSeatsChange}
          onCategoryChange={onCategoryChange}
          aria-labelledby="category-selection-title"
        />
        
        <div className="mt-6">
          <Button 
            className="w-full" 
            onClick={onContinue} 
            disabled={isDisabled}
            type="button"
            id="continue-to-payment"
            name="continue-to-payment"
            aria-label="Continue to payment"
          >
            Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
