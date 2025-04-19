
import { Card, CardContent } from "@/components/ui/card";
import { SeatCategorySelector } from "@/components/booking/SeatCategorySelector";

interface MatchDetailsCardProps {
  matchId: string;
  team1Name: string;
  team2Name: string;
  matchDate: string;
  stadium?: {
    name?: string;
    location?: string;
  };
  sections: Array<{
    id: string;
    name: string;
    category?: string;
    color?: string;
    price: number;
    available: number;
  }>;
  onCategoryChange: (categoryData: {
    sectionId: string;
    price: number;
    quantity: number;
    totalPrice: number;
    sectionName: string;
  }) => void;
  selectedSection: string | null;
  selectedSeats: number;
  onSectionChange: (sectionId: string) => void;
  onSeatsChange: (count: number) => void;
}

export const MatchDetailsCard = ({ 
  matchId,
  team1Name,
  team2Name,
  matchDate,
  stadium,
  sections,
  onCategoryChange,
  selectedSection,
  selectedSeats,
  onSectionChange,
  onSeatsChange
}: MatchDetailsCardProps) => {
  // Safe format date with fallback
  const formattedDate = matchDate ? new Date(matchDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Date not available';
  
  const stadiumDisplay = stadium?.name && stadium?.location 
    ? `${stadium.name}, ${stadium.location}` 
    : stadium?.name || 'Venue information not available';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2" id="match-details-heading">Match Details</h2>
          <p className="text-gray-700">
            <span className="font-medium">{team1Name || 'Team 1'} vs {team2Name || 'Team 2'}</span>
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {formattedDate}
          </p>
          <p className="text-gray-600 text-sm">
            {stadiumDisplay}
          </p>
        </div>

        <div className="mt-6" aria-labelledby="seating-area-heading">
          <h3 className="text-lg font-medium mb-4" id="seating-area-heading">Choose Seating Area</h3>
          
          <SeatCategorySelector
            matchId={matchId}
            onCategoryChange={onCategoryChange}
            sections={sections || []}
            onSectionChange={onSectionChange}
            onSeatsChange={onSeatsChange}
            selectedSection={selectedSection || ''}
            selectedSeats={selectedSeats}
            aria-labelledby="seating-area-heading"
          />
        </div>
      </CardContent>
    </Card>
  );
};
