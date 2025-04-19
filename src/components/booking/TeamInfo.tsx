
import React from "react";
import { Stadium } from "@/types/database";
import { formatDate } from "@/utils/dateUtils";
import { handleLogoError } from "@/utils/teamUtils";

interface TeamInfoProps {
  team1Name: string;
  team2Name: string;
  matchDate: string;
  stadium?: Stadium | null;
  team1Logo?: string;
  team2Logo?: string;
}

export const TeamInfo: React.FC<TeamInfoProps> = ({
  team1Name,
  team2Name,
  matchDate,
  stadium,
  team1Logo,
  team2Logo,
}) => {
  const formattedDateObj = formatMatchDate(matchDate);

  return (
    <div className="mb-6 p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center justify-between w-full md:w-auto mb-4 md:mb-0">
          <div className="flex flex-col items-center mx-2">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
              {team1Logo ? (
                <img
                  src={team1Logo}
                  alt={`${team1Name} logo`}
                  className="w-12 h-12 object-contain"
                  onError={(e) => handleLogoError(e, team1Name)}
                />
              ) : (
                <div className="text-lg font-bold">
                  {team1Name.substring(0, 2)}
                </div>
              )}
            </div>
            <span className="mt-2 font-medium text-sm">{team1Name}</span>
          </div>

          <div className="mx-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-1">VS</span>
            <div className="h-px w-12 bg-gray-200"></div>
          </div>

          <div className="flex flex-col items-center mx-2">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
              {team2Logo ? (
                <img
                  src={team2Logo}
                  alt={`${team2Name} logo`}
                  className="w-12 h-12 object-contain"
                  onError={(e) => handleLogoError(e, team2Name)}
                />
              ) : (
                <div className="text-lg font-bold">
                  {team2Name.substring(0, 2)}
                </div>
              )}
            </div>
            <span className="mt-2 font-medium text-sm">{team2Name}</span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <div className="text-sm text-gray-500">{formattedDateObj.date}</div>
          <div className="text-sm font-medium">{formattedDateObj.time}</div>
          <div className="text-sm mt-1">
            {stadium?.name || "Unknown Venue"}
          </div>
        </div>
      </div>
    </div>
  );
};

function formatMatchDate(dateString: string): { date: string; time: string } {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return { date: "TBD", time: "TBD" };
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit"
    };
    
    const formattedDate = date.toLocaleString("en-IN", dateOptions);
    const formattedTime = date.toLocaleString("en-IN", timeOptions);
    
    return {
      date: formattedDate,
      time: formattedTime
    };
  } catch (error) {
    console.error("Error formatting match date:", error);
    return { date: "TBD", time: "TBD" };
  }
}
