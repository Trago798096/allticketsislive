import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { fetchMatch, fetchSeatCategories, calculateTotalPrice } from "@/services/matchService";
import { toast } from "sonner";
import { TeamInfo } from "./TeamInfo";
import { BookingMatchDetails } from "./BookingMatchDetails";
import { SeatCategory, Team } from "@/types/database";
import { BookingSummary } from "./BookingSummary";
import { TicketIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function BookingForm() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const { data: match, isLoading: matchLoading, error: matchError } = useQuery({
    queryKey: ["match", id],
    queryFn: () => fetchMatch(id || ""),
    enabled: !!id
  });
  
  const { data: seatCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["seat-categories", id],
    queryFn: () => fetchSeatCategories(id || ""),
    enabled: !!id
  });
  
  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      
      if (user.user_metadata) {
        if (user.user_metadata.full_name) {
          setName(user.user_metadata.full_name);
        } else if (user.user_metadata.name) {
          setName(user.user_metadata.name);
        }
        
        if (user.user_metadata.phone) {
          setPhone(user.user_metadata.phone);
        }
      }
      
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (!error && data) {
          if (data.first_name && data.last_name) {
            setName(`${data.first_name} ${data.last_name}`.trim());
          } else if (data.first_name) {
            setName(data.first_name);
          }
          
          if (data.phone) {
            setPhone(data.phone);
          }
        }
      };
      
      fetchProfile();
    }
  }, [user]);
  
  useEffect(() => {
    if (seatCategories && seatCategories.length > 0 && !selectedSection) {
      setSelectedSection(seatCategories[0].id);
    }
  }, [seatCategories, selectedSection]);
  
  useEffect(() => {
    if (selectedSection && seatCategories) {
      const category = seatCategories.find(cat => cat.id === selectedSection);
      if (category) {
        setTotalPrice(calculateTotalPrice(category.price, selectedSeats));
      }
    }
  }, [selectedSection, selectedSeats, seatCategories]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to continue");
      navigate("/auth?redirect=" + encodeURIComponent(`/booking/${id}`));
      return;
    }
    
    if (!selectedSection) {
      toast.error("Please select a seating section");
      return;
    }
    
    if (!name || !email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    
    try {
      const section = seatCategories?.find(s => s.id === selectedSection);
      
      if (!section) {
        toast.error("Selected section not found");
        setLoading(false);
        return;
      }
      
      if (section.availability < selectedSeats) {
        toast.error(`Only ${section.availability} tickets available in this section`);
        setLoading(false);
        return;
      }
      
      console.log("Saving booking data to localStorage", {
        matchId: id,
        sectionId: selectedSection,
        seats: selectedSeats,
        totalPrice,
        userName: name,
        userEmail: email,
        userPhone: phone,
      });
      
      localStorage.setItem("booking", JSON.stringify({
        matchId: id,
        sectionId: selectedSection,
        seats: selectedSeats,
        totalPrice,
        userName: name,
        userEmail: email,
        userPhone: phone,
      }));
      
      console.log("Navigating to payment page");
      navigate("/payment");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking");
      setLoading(false);
    }
  };
  
  if (matchLoading || categoriesLoading) {
    return <LoadingState message="Loading match details..." />;
  }
  
  if (matchError || !match) {
    return (
      <ErrorState
        title="Match not found"
        message="The match you're looking for doesn't exist or has been removed."
        redirectPath="/matches"
        redirectLabel="View All Matches"
      />
    );
  }
  
  const getTeamName = (teamId: any, teamObject: any): string => {
    if (teamObject && typeof teamObject === 'object') {
      return teamObject.team_name || teamObject.name || "Team";
    }
    
    if (teamId && typeof teamId === 'object') {
      return (teamId as any).team_name || (teamId as any).name || "Team";
    }
    
    return "Team";
  };
  
  const team1Name = getTeamName(match.team1_id, match.team1);
  const team2Name = getTeamName(match.team2_id, match.team2);
  
  const getTeamLogo = (teamId: any): string | undefined => {
    if (!teamId) return undefined;
    
    if (typeof teamId === 'object' && teamId !== null) {
      const logoUrl = (teamId as any).logo_url || (teamId as any).logo;
      if (logoUrl) {
        return `https://mlmibkkiunueyidehdbt.supabase.co/storage/v1/object/public/team-logos/${logoUrl}`;
      }
    }
    
    return undefined;
  };
  
  const team1Logo = match.team1?.logo || getTeamLogo(match.team1_id);
  const team2Logo = match.team2?.logo || getTeamLogo(match.team2_id);
  
  const sectionOptions = seatCategories?.map((cat: any) => ({
    value: cat.id,
    label: `${cat.name || "General"} - ₹${cat.price}`,
    price: cat.price,
    available: cat.availability
  })) || [];
  
  const stadium = match.stadium || {
    name: match.venue,
    location: ""
  };
  
  const handleContinue = () => {
    console.log("Continue button clicked");
    const event = new Event('submit') as unknown as React.FormEvent;
    handleSubmit(event);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <BookingMatchDetails match={match} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-6" id="booking-form">
              <TeamInfo 
                team1Name={team1Name} 
                team2Name={team2Name} 
                matchDate={match.match_date || match.date || new Date().toISOString()} 
                stadium={match.stadium}
                team1Logo={team1Logo}
                team2Logo={team2Logo}
              />
              
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="w-5 h-5 mr-2 text-ipl-blue">🏏</span>
                  Select Tickets
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="section" className="block text-sm font-medium mb-2">
                        Seating Category
                      </Label>
                      <Select
                        value={selectedSection}
                        onValueChange={(value) => setSelectedSection(value)}
                        disabled={sectionOptions.length === 0}
                      >
                        <SelectTrigger id="section" className="w-full">
                          <SelectValue placeholder="Select seating category" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionOptions.length > 0 ? (
                            sectionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} disabled={option.available < 1}>
                                {option.label} {option.available < 10 ? `(Only ${option.available} left)` : ""}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No seating categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="tickets" className="block text-sm font-medium mb-2">
                        Number of Tickets
                      </Label>
                      <Select
                        value={selectedSeats.toString()}
                        onValueChange={(value) => setSelectedSeats(parseInt(value))}
                      >
                        <SelectTrigger id="tickets" className="w-full">
                          <SelectValue placeholder="Select number of tickets" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                            const selectedCategory = seatCategories?.find(cat => cat.id === selectedSection);
                            const isDisabled = selectedCategory ? selectedCategory.availability < num : false;
                            
                            return (
                              <SelectItem key={num} value={num.toString()} disabled={isDisabled}>
                                {num} Ticket{num > 1 ? 's' : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <TicketIcon className="w-5 h-5 mr-2 text-ipl-blue" />
                  Personal Information
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <BookingSummary
            summaryId="booking-summary"
            selectedSeats={selectedSeats}
            totalPrice={totalPrice}
            sectionName={seatCategories?.find(s => s.id === selectedSection)?.name || "General"}
            onContinue={handleContinue}
            isDisabled={loading || !selectedSection || selectedSeats < 1}
            matchDetails={{
              team1Name: team1Name,
              team2Name: team2Name,
              venue: stadium?.name || match.venue || "TBD",
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
  );
}
