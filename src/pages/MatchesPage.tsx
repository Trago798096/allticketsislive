
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMatches } from "@/services/matchService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchCard from "@/components/MatchCard";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Match, MatchDetails } from "@/types/database";
import { getTeamInfo } from "@/utils/teamUtils";

const MatchesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
  });
  
  // Convert Match[] to MatchDetails[] and then filter
  const filteredMatches: MatchDetails[] = Array.isArray(matches) 
    ? matches
        .map((match: Match): MatchDetails => {
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
            availability: match.availability || "High"
          };
        })
        .filter((match: MatchDetails) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            match.team1.name.toLowerCase().includes(searchLower) ||
            match.team2.name.toLowerCase().includes(searchLower) ||
            (match.venue || '').toLowerCase().includes(searchLower)
          );
        })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-ipl-purple/10 to-ipl-blue/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
              All Upcoming Matches
            </h1>
            
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search by team or venue..."
                  className="pl-10 pr-4 py-2 rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" />
              </div>
            ) : filteredMatches && filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMatches.map((match: MatchDetails) => (
                  <div key={match.id} className="animate-fade-in">
                    <MatchCard match={match} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl text-gray-500">No matches found</h3>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MatchesPage;
