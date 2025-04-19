
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MatchCard from "./MatchCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, Flame, Loader2, AlertTriangle } from "lucide-react";
import { fetchMatches } from "@/services/matchService";
import { MatchDetails, Match } from "@/types/database";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getTeamInfo } from "@/utils/teamUtils";

const MatchesSection = () => {
  const [visibleMatches, setVisibleMatches] = useState<MatchDetails[]>([]);
  
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      try {
        const data = await fetchMatches();
        return data;
      } catch (err) {
        console.error("Error fetching matches:", err);
        toast.error("Failed to load matches", {
          description: "Please try again later"
        });
        return [];
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (matches && matches.length > 0) {
      // Convert Match[] to MatchDetails[] before setting state
      const mappedMatches: MatchDetails[] = matches.slice(0, 4).map((match: Match) => {
        const team1Info = getTeamInfo(match.team1 || match.team1_details || {});
        const team2Info = getTeamInfo(match.team2 || match.team2_details || {});
        
        return {
          id: match.id,
          team1: {
            name: team1Info.name,
            shortName: team1Info.shortName,
            logo: team1Info.logo,
            ticketPrice: team1Info.ticketPrice
          },
          team2: {
            name: team2Info.name,
            shortName: team2Info.shortName, 
            logo: team2Info.logo,
            ticketPrice: team2Info.ticketPrice
          },
          date: match.date || match.match_date || new Date().toISOString(),
          time: match.time || new Date(match.match_date || Date.now()).toLocaleTimeString(),
          venue: match.venue || (match.stadium?.name || "TBD"),
          isLive: match.status === "live",
          isUpcoming: match.status === "upcoming",
          availability: "High"
        };
      });
      
      setVisibleMatches(mappedMatches);
    } else if (matches && matches.length === 0) {
      console.warn("No matches data available");
    }
  }, [matches]);

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-white to-ipl-softBlue/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="text-red-500 h-8 w-8" />
            <p className="text-red-500">Unable to load matches. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-white to-ipl-softBlue/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Flame className="text-ipl-orange" size={24} />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-ipl-blue to-ipl-purple bg-clip-text text-transparent">Upcoming Matches</h2>
          </div>
          <Link to="/matches">
            <Button variant="ghost" className="text-ipl-blue hover:text-ipl-purple flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" />
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleMatches.map((match, index) => (
              <div 
                key={match.id || index} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-2">No upcoming matches found</p>
            <p className="text-sm text-gray-400">Check back later for updates</p>
          </div>
        )}
        
        {matches && matches.length > 0 && (
          <div className="mt-12 text-center">
            <Link to="/matches">
              <Button size="lg" className="bg-gradient-to-r from-ipl-purple to-ipl-blue hover:opacity-90 text-white rounded-full shadow-md px-8">
                View All Matches
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default MatchesSection;
