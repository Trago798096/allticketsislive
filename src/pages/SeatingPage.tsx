import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchMatch, fetchSeatCategoriesForMatch } from "@/services/matchService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/booking/LoadingState";
import { ErrorState } from "@/components/booking/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { TeamInfo } from "@/components/booking/TeamInfo";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { SeatCategorySelector } from "@/components/booking/SeatCategorySelector";
import { SeatCategory } from "@/types/database";

interface SectionData {
  id: string;
  name: string;
  category?: string;
  color?: string;
  price: number;
  available: number;
}

const SeatingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  
  const bookingFormId = `booking-form-${id || 'new'}`;
  const summaryId = `booking-summary-${id || 'new'}`;
  const pageTitle = "Select Your Seats";

  const matchId = id || '';
  
  console.log("SeatingPage - Current matchId:", matchId);
  console.log("SeatingPage - Current user:", user?.email);
  console.log("SeatingPage - Current session:", session?.access_token ? "Valid session" : "No session");

  useEffect(() => {
    if (!user && !session) {
      console.log("No user or session found, redirecting to login");
      toast.error("Please login to continue booking");
      navigate("/auth?redirect=" + encodeURIComponent(`/seating/${id}`));
    }
  }, [user, session, id, navigate]);

  const { data: match, isLoading: isLoadingMatch, error: matchError } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      console.log("Fetching match data for:", matchId);
      if (!matchId) {
        throw new Error("Match ID is required");
      }
      
      try {
        const matchData = await fetchMatch(matchId);
        console.log("Match data result:", matchData);
        
        if (!matchData) {
          throw new Error("Match not found");
        }
        
        return matchData;
      } catch (error) {
        console.error("Error fetching match:", error);
        throw error;
      }
    },
    enabled: !!matchId && !!user,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: seatCategories, isLoading: isLoadingSections } = useQuery({
    queryKey: ["seat-categories", matchId],
    queryFn: async () => {
      console.log("Fetching seat categories for:", matchId);
      if (!matchId) return [];
      try {
        const categories = await fetchSeatCategoriesForMatch(matchId);
        console.log("Seat categories result:", categories);
        return categories || [];
      } catch (error) {
        console.error("Error fetching seat categories:", error);
        return [];
      }
    },
    enabled: !!matchId && !!user,
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (selectedSection && seatCategories && seatCategories.length > 0) {
      const category = seatCategories.find(p => p.id === selectedSection);
      if (category) {
        setTotalPrice(category.price * selectedSeats);
      }
    } else {
      setTotalPrice(0);
    }
  }, [selectedSection, selectedSeats, seatCategories]);

  const getUserName = (): string => {
    if (!user) return '';
    
    if (typeof user === 'object' && user !== null) {
      if ('profile' in user && user.profile) {
        const profile = user.profile as Record<string, any>;
        return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }
      
      if ('firstName' in user || 'lastName' in user) {
        const userData = user as Record<string, any>;
        return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      }
    }
    
    return '';
  };

  const handleCategoryChange = (categoryData: {
    sectionId: string;
    price: number;
    quantity: number;
    totalPrice: number;
    sectionName: string;
  }) => {
    setSelectedSection(categoryData.sectionId);
    setSelectedSeats(categoryData.quantity);
    setTotalPrice(categoryData.totalPrice);
  };

  const handleContinue = () => {
    if (!selectedSection) {
      toast.error("Please select a seating section");
      return;
    }

    if (selectedSeats < 1) {
      toast.error("Please select at least one seat");
      return;
    }

    if (!matchId) {
      toast.error("Invalid match selected");
      return;
    }

    const sectionName = seatCategories?.find(p => p.id === selectedSection)?.name || "";
    
    const bookingData = {
      matchId: matchId,
      seatCategoryId: selectedSection,
      sectionName: sectionName,
      quantity: selectedSeats,
      totalAmount: totalPrice,
      ticketPrice: seatCategories?.find(p => p.id === selectedSection)?.price || 0,
      name: getUserName(),
      email: user?.email || '',
      phone: user?.phone || '',
      convenienceFee: Math.round(totalPrice * 0.05) // 5% convenience fee
    };
    
    console.log("Saving booking data to sessionStorage", bookingData);
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    const savedData = sessionStorage.getItem("bookingData");
    if (savedData) {
      console.log("Navigation to payment page with booking data saved");
      navigate(`/payment/${matchId}`);
    } else {
      toast.error("Failed to save booking data");
      console.error("Failed to save booking data to sessionStorage");
    }
  };

  if (isLoadingMatch || isLoadingSections) {
    return <LoadingState message="Loading match details..." />;
  }

  if (matchError) {
    console.error("Match error details:", matchError);
    return (
      <ErrorState 
        title="Error loading match details"
        message="Unable to load the match information. Please try again."
        redirectPath="/matches"
        redirectLabel="View All Matches"
      />
    );
  }

  if (!match) {
    console.log("Match not found with ID:", matchId);
    return (
      <ErrorState 
        title="Match not found"
        message="The requested match could not be found."
        redirectPath="/matches"
        redirectLabel="View All Matches"
      />
    );
  }

  const getTeamName = (teamDetails: any | null, fallbackName: string, teamId?: string): string => {
    if (!teamDetails) {
      return teamId || fallbackName;
    }
    
    if (
      typeof teamDetails === 'object' && 
      teamDetails !== null
    ) {
      return String(teamDetails.team_name || teamDetails.name || fallbackName);
    }
    
    return teamId || fallbackName;
  };

  const team1Name = match ? getTeamName(
    match.team1, 
    match.team1_id || 'Team 1', 
    typeof match.team1_id === 'string' ? match.team1_id : undefined
  ) : 'Team 1';
  
  const team2Name = match ? getTeamName(
    match.team2, 
    match.team2_id || 'Team 2',
    typeof match.team2_id === 'string' ? match.team2_id : undefined
  ) : 'Team 2';

  const formattedSections: SectionData[] = seatCategories?.map((category: any) => {
    return {
      id: category.id,
      name: category.name || 'Unknown Section',
      price: category.price || 0,
      available: category.availability || 0,
    };
  }) || [];

  const currentSectionName = selectedSection 
    ? seatCategories?.find(p => p.id === selectedSection)?.name
    : undefined;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 
            className="text-3xl font-bold bg-gradient-to-r from-ipl-blue to-ipl-purple bg-clip-text text-transparent mb-6" 
            id="page-title"
          >
            {pageTitle}
          </h1>
          
          <div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6" 
            role="main" 
            aria-labelledby="page-title"
          >
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <form 
                    id={bookingFormId} 
                    aria-label="Seat selection form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleContinue();
                    }}
                  >
                    <TeamInfo 
                      team1Name={team1Name}
                      team2Name={team2Name}
                      matchDate={match.match_date || match.date || new Date().toISOString()}
                      stadium={match.stadium}
                    />
                    
                    <SeatCategorySelector
                      matchId={matchId}
                      sections={formattedSections}
                      onCategoryChange={handleCategoryChange}
                      selectedSection={selectedSection || ""}
                      selectedSeats={selectedSeats}
                      onSectionChange={setSelectedSection}
                      onSeatsChange={setSelectedSeats}
                      aria-labelledby="page-title"
                    />
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <BookingSummary
                summaryId={summaryId}
                aria-labelledby="page-title"
                selectedSeats={selectedSeats}
                totalPrice={totalPrice}
                sectionName={currentSectionName || ''}
                onContinue={handleContinue}
                isDisabled={!selectedSection || selectedSeats < 1}
                matchDetails={{
                  team1Name,
                  team2Name,
                  venue: match.stadium?.name || match.venue || "TBD",
                  date: match.match_date ? new Date(match.match_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : "TBD"
                }}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SeatingPage;
