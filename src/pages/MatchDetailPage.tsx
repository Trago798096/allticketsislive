import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchMatchById } from "@/services/matchService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Ticket, ArrowLeft, Users, ChevronsRight, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CricketBallIcon } from "@/components/ui/cricket-icons";
import { getTeamLogo, handleLogoError } from "@/utils/teamUtils";

const MatchDetailPage = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    data: match,
    isLoading,
    error
  } = useQuery({
    queryKey: ["match", id],
    queryFn: () => fetchMatchById(id!),
    enabled: !!id
  });
  
  if (isLoading) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96 col-span-2" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  
  if (error || !match) {
    return <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-6">
              <Info size={48} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
              <p className="text-gray-500 mb-8">
                The match you're looking for does not exist or has been removed.
              </p>
              <Link to="/matches">
                <Button className="bg-ipl-blue hover:bg-ipl-blue/90">
                  View All Matches
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  
  const minPrice = match.team1?.ticketPrice ? parseInt(match.team1.ticketPrice) : 999;
  const maxPrice = match.team2?.ticketPrice ? parseInt(match.team2.ticketPrice) : 11999;
  
  const ticketPriceRange = `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;
  
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Link to="/matches" className="inline-flex items-center text-ipl-blue hover:text-ipl-purple mb-6">
            <ArrowLeft size={16} className="mr-2" />
            <span>Back to Matches</span>
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-ipl-purple to-ipl-blue p-5 flex justify-between items-center">
                  <h1 className="text-xl md:text-2xl font-bold text-white">Match Details</h1>
                  {match.isLive ? <div className="flex items-center">
                      <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span className="font-semibold text-white">LIVE NOW</span>
                    </div> : match.isUpcoming ? <Badge className="bg-green-500 hover:bg-green-600">Upcoming</Badge> : <Badge variant="outline" className="text-white border-white">Completed</Badge>}
                </div>
                
                <CardContent className="p-6">
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-5 items-center">
                      <div className="col-span-2 flex flex-col items-center">
                        <img 
                          src={getTeamLogo(match.team1)} 
                          alt={match.team1?.name || match.team1?.team_name || "Team 1"} 
                          className="w-24 h-24 mb-4 object-contain"
                          onError={(e) => handleLogoError(e, match.team1?.name || match.team1?.team_name || "Team 1")}
                        />
                        <h2 className="text-lg font-bold">{match.team1?.name || match.team1?.team_name || "Team 1"}</h2>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-400">VS</div>
                      </div>
                      
                      <div className="col-span-2 flex flex-col items-center">
                        <img 
                          src={getTeamLogo(match.team2)} 
                          alt={match.team2?.name || match.team2?.team_name || "Team 2"} 
                          className="w-24 h-24 mb-4 object-contain"
                          onError={(e) => handleLogoError(e, match.team2?.name || match.team2?.team_name || "Team 2")} 
                        />
                        <h2 className="text-lg font-bold">{match.team2?.name || match.team2?.team_name || "Team 2"}</h2>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="text-ipl-blue" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="font-medium">{match.date || new Date(match.match_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="text-ipl-blue" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Time</div>
                          <div className="font-medium">{match.time || new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="text-ipl-blue" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Venue</div>
                          <div className="font-medium">{match.venue || (match.stadium?.name || "Stadium")}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Ticket className="text-ipl-blue" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Ticket Price</div>
                          <div className="font-bold text-lg">{ticketPriceRange}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Users className="text-ipl-blue" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">Availability</div>
                          <div>
                            <Badge variant="outline" className={`
                              ${match.availability === 'High' ? 'bg-green-100 text-green-800' : match.availability === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}
                            `}>
                              {match.availability || 'Limited'} Availability
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Match #{id?.substring(0, 8)}</h3>
                      <p className="text-gray-500">{ticketPriceRange}</p>
                    </div>
                    <Link to={`/booking/${match.id}`}>
                      <Button size="lg" className="bg-gradient-to-r from-ipl-purple to-ipl-blue hover:opacity-90 text-white shadow-md w-full md:w-auto">
                        <Ticket className="mr-2 h-5 w-5" />
                        Book Tickets
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="shadow-lg">
                <div className="bg-gradient-to-r from-ipl-blue to-ipl-purple p-5">
                  <h2 className="text-xl font-bold text-white">Stadium Information</h2>
                </div>
                
                <CardContent className="p-6">
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                    <img src="/assets/stadium-default.jpg" alt="Stadium" className="w-full h-full object-cover" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{match.venue || (match.stadium?.name || "Stadium")}</h3>
                  <p className="text-gray-600 mb-4">
                    One of the premier cricket venues in India, known for its electrifying atmosphere and world-class facilities.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <ChevronsRight size={16} className="text-ipl-blue" />
                      <span>Capacity: {match.stadium?.capacity || '40,000'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronsRight size={16} className="text-ipl-blue" />
                      <span>Parking Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronsRight size={16} className="text-ipl-blue" />
                      <span>Food & Beverages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronsRight size={16} className="text-ipl-blue" />
                      <span>Security Checks Required</span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm">
                    <div className="flex">
                      <Info size={20} className="text-yellow-600 mr-2 flex-shrink-0" />
                      <p className="text-yellow-700">
                        Please arrive at least 1 hour before the match start time to avoid last-minute rush.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 flex justify-center">
                <div className="animate-float bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 border border-gray-100">
                  <div className="bg-ipl-blue/10 p-2 rounded-full">
                    <CricketBallIcon className="text-ipl-blue h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Starting from</div>
                    <div className="text-2xl font-bold text-ipl-blue">₹{minPrice.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};

export default MatchDetailPage;
