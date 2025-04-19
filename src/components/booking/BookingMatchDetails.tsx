
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Match } from "@/types/database";
import { logError } from "@/utils/errorLogger";
import { getTeamLogo } from "@/utils/teamUtils";

interface BookingMatchDetailsProps {
  match: Match;
}

export const BookingMatchDetails: React.FC<BookingMatchDetailsProps> = ({ match }) => {
  if (!match) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Match details not available</p>
        </div>
      </div>
    );
  }

  // Safely extract team information with proper type checking
  let team1Name = "Team 1";
  let team2Name = "Team 2";
  let formattedDate = "Date TBD";
  let formattedTime = "Time TBD";
  let venue = "Venue TBD";
  let team1Logo = "";
  let team2Logo = "";
  
  try {
    // Extract team1 name and logo with fallbacks
    if (match.team1) {
      if (typeof match.team1 === 'object' && match.team1 !== null) {
        team1Name = match.team1.team_name || match.team1.name || "Team 1";
        team1Logo = getTeamLogo(match.team1);
      }
    } else if (match.team1_id && typeof match.team1_id === 'object') {
      team1Name = (match.team1_id as any).team_name || (match.team1_id as any).name || "Team 1";
      team1Logo = getTeamLogo(match.team1_id);
    }
    
    // Extract team2 name and logo with fallbacks
    if (match.team2) {
      if (typeof match.team2 === 'object' && match.team2 !== null) {
        team2Name = match.team2.team_name || match.team2.name || "Team 2";
        team2Logo = getTeamLogo(match.team2);
      }
    } else if (match.team2_id && typeof match.team2_id === 'object') {
      team2Name = (match.team2_id as any).team_name || (match.team2_id as any).name || "Team 2";
      team2Logo = getTeamLogo(match.team2_id);
    }
    
    // Format date if available
    if (match.match_date) {
      const matchDate = new Date(match.match_date);
      formattedDate = matchDate.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      formattedTime = matchDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (match.date) {
      const matchDate = new Date(match.date);
      formattedDate = matchDate.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      formattedTime = matchDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Get venue with fallbacks
    if (match.stadium && typeof match.stadium === 'object') {
      venue = match.stadium.name || "Venue TBD";
    } else if (match.venue) {
      venue = match.venue;
    }
  } catch (error) {
    logError(error, "BookingMatchDetails", { matchId: match.id });
    console.error("Error processing match details:", error);
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8" aria-labelledby="match-details-heading">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center mb-6">
          <div className="flex items-center flex-1">
            <div className="flex flex-col items-center mr-4">
              {team1Logo ? (
                <img 
                  src={team1Logo}
                  alt={`${team1Name} logo`}
                  className="w-16 h-16 object-contain rounded-full border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/default-team.png";
                    console.warn(`Failed to load logo for ${team1Name}`);
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <span className="text-lg font-bold">{team1Name.substring(0, 2)}</span>
                </div>
              )}
              <span className="mt-2 text-sm font-medium">{team1Name}</span>
            </div>
            
            <div className="mx-4 text-center">
              <div className="text-lg font-bold">VS</div>
              <div className="text-xs text-gray-500">{formattedTime}</div>
            </div>
            
            <div className="flex flex-col items-center ml-4">
              {team2Logo ? (
                <img 
                  src={team2Logo}
                  alt={`${team2Name} logo`}
                  className="w-16 h-16 object-contain rounded-full border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/default-team.png";
                    console.warn(`Failed to load logo for ${team2Name}`);
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <span className="text-lg font-bold">{team2Name.substring(0, 2)}</span>
                </div>
              )}
              <span className="mt-2 text-sm font-medium">{team2Name}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <p className="text-gray-600">{formattedDate}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPinIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <p className="text-gray-600">{venue}</p>
              </div>
              
              {match.status === 'live' && (
                <Badge variant="destructive" className="animate-pulse mt-2 self-start">LIVE</Badge>
              )}
              {match.status === 'upcoming' && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 mt-2 self-start">Upcoming</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
