
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Ticket, MapPin } from "lucide-react";
import { MatchDetails } from "@/types/database";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getTeamInfo, handleLogoError } from "@/utils/teamUtils";
import { isValidUUID } from "@/hooks/use-uuid";

const MatchCard = ({ match }: { match: MatchDetails }) => {
  const [team1ImageError, setTeam1ImageError] = useState(false);
  const [team2ImageError, setTeam2ImageError] = useState(false);
  
  // Make sure we have valid match data
  if (!match || !match.id || !isValidUUID(match.id)) {
    console.error("Invalid match data or UUID", match);
    return null;
  }

  // Handle team data with robust fallbacks
  const team1Info = getTeamInfo(match.team1);
  const team2Info = getTeamInfo(match.team2);

  // Extract match details with safe defaults
  const matchDate = match.date || (match.match_date ? match.match_date : new Date().toISOString());
  const date = new Date(matchDate).toLocaleDateString() || "TBD";
  const time = new Date(matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "TBD";
  const venue = match.venue || (match.stadium && match.stadium.name ? match.stadium.name : "TBD");
  const isLive = match.isLive || (match.status === "live");
  const isUpcoming = match.isUpcoming || (match.status === "upcoming");
  
  // Calculate availability status
  const calculateAvailability = () => {
    if (match.availability) {
      return match.availability;
    }
    
    if (match.seatCategories && Array.isArray(match.seatCategories) && match.seatCategories.length > 0) {
      const totalSeats = match.seatCategories.reduce((sum, cat) => sum + (cat.availability || 0), 0);
      if (totalSeats <= 0) return "Sold Out";
      if (totalSeats < 50) return "Low";
      if (totalSeats < 200) return "Medium";
      return "High";
    }
    return "Available";
  };
  
  const availability = calculateAvailability();
  
  // Get the minimum ticket price
  const getMinTicketPrice = () => {
    if (match.seatCategories && Array.isArray(match.seatCategories) && match.seatCategories.length > 0) {
      const prices = match.seatCategories
        .map(cat => Number(cat.price))
        .filter(price => !isNaN(price) && price > 0);
      
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    
    // Fallback to team ticket price if available
    const teamPrice = Number(team1Info.ticketPrice);
    if (!isNaN(teamPrice) && teamPrice > 0) {
      return teamPrice;
    }
    
    // Default value if no prices are available
    return 699;
  };
  
  const ticketPrice = getMinTicketPrice();

  const getAvailabilityColor = () => {
    switch (availability) {
      case "High": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-orange-100 text-orange-800";
      case "Sold Out": return "bg-red-100 text-red-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  // Handle booking navigation
  const handleBookNow = () => {
    // Store a flag to indicate we're coming from match details
    sessionStorage.setItem('fromMatchDetails', 'true');
  };

  // Generate unique IDs for this match card
  const cardId = `match-card-${match.id}`;
  const bookButtonId = `book-btn-${match.id}`;
  const detailsButtonId = `details-btn-${match.id}`;

  return (
    <Card className="overflow-hidden border-gray-200 shadow-md hover:shadow-lg transition-shadow group" id={cardId}>
      <div className="bg-gradient-to-r from-ipl-purple to-ipl-blue p-3 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="font-semibold text-sm">LIVE</span>
            </>
          ) : isUpcoming ? (
            <>
              <CalendarIcon className="w-4 h-4 text-ipl-gold" />
              <span className="font-semibold text-sm">Upcoming</span>
            </>
          ) : (
            <span className="font-semibold text-sm">MATCH</span>
          )}
        </div>
        <div className="text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{date || "TBD"} • {time || "TBD"}</span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-4">
          <MapPin size={12} />
          <span>{venue || "Venue TBD"}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 mb-2 transition-transform group-hover:scale-110">
              <img 
                src={team1ImageError ? "/teams/default.png" : team1Info.logo} 
                alt={`${team1Info.name} logo`} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  setTeam1ImageError(true);
                  handleLogoError(e, team1Info.name);
                }}
              />
            </div>
            <div className="font-semibold text-sm">{team1Info.shortName || "TBD"}</div>
            <div className="text-xs text-gray-500 text-center truncate max-w-full">{team1Info.name}</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-xl font-bold text-gray-400">VS</div>
            <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
              {isLive ? "In Progress" : isUpcoming ? "Upcoming" : "Finished"}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 mb-2 transition-transform group-hover:scale-110">
              <img 
                src={team2ImageError ? "/teams/default.png" : team2Info.logo} 
                alt={`${team2Info.name} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  setTeam2ImageError(true);
                  handleLogoError(e, team2Info.name);
                }}
              />
            </div>
            <div className="font-semibold text-sm">{team2Info.shortName || "TBD"}</div>
            <div className="text-xs text-gray-500 text-center truncate max-w-full">{team2Info.name}</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="text-sm">Starts from:</div>
          <div className="font-bold text-lg text-ipl-blue">₹{ticketPrice}</div>
        </div>
        
        <div className="flex items-center justify-center mt-2">
          <Badge variant="outline" className={`text-xs ${getAvailabilityColor()}`}>
            {availability} Availability
          </Badge>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link to={`/match/${match.id}`}>
            <Button 
              variant="outline" 
              className="border-ipl-blue text-ipl-blue hover:bg-ipl-blue hover:text-white w-full"
              id={detailsButtonId}
              name={detailsButtonId}
            >
              View Details
            </Button>
          </Link>
          <Link to={`/booking/${match.id}`} onClick={handleBookNow}>
            <Button 
              className="bg-gradient-to-r from-ipl-purple to-ipl-blue hover:opacity-90 text-white flex items-center justify-center gap-1 w-full"
              id={bookButtonId}
              name={bookButtonId}
            >
              <Ticket className="w-4 h-4" />
              <span>Book Now</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
