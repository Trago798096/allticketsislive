
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBookingById } from "@/services/bookingService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ticket, Calendar, MapPin, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/dateUtils";
import { RedBookMyShowLogo } from "@/components/ui/cricket-icons";
import { useAuth } from "@/context/AuthContext";
import ConfettiScript from "@/components/utils/ConfettiScript";

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bookingId = searchParams.get('id');
  const [confettiLaunched, setConfettiLaunched] = useState(false);
  
  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      return fetchBookingById(bookingId);
    },
    enabled: !!bookingId,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    // Launch confetti animation when booking loads
    if (booking && !confettiLaunched && typeof window.confetti === 'function') {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from both sides
        window.confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2
          }
        });
        
        window.confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2
          }
        });
      }, 250);
      
      setConfettiLaunched(true);
    }
  }, [booking, confettiLaunched]);

  // Handle redirection if no booking ID
  useEffect(() => {
    if (!bookingId) {
      toast.error("Booking information not found");
      navigate("/");
    }
  }, [bookingId, navigate]);

  // Extract match and section name
  const getMatchDetails = () => {
    if (!booking?.match) return { team1: "Team 1", team2: "Team 2", date: "TBD", venue: "Venue" };
    
    const team1 = booking.match.team1?.name || booking.match.team1_details?.team_name || "Team 1";
    const team2 = booking.match.team2?.name || booking.match.team2_details?.team_name || "Team 2";
    const date = formatDate(booking.match.match_date || "", true);
    const venue = booking.match.stadium?.name || booking.match.venue || "Venue";
    
    return { team1, team2, date, venue };
  };
  
  const getSectionName = () => {
    if (!booking) return "General";
    
    if (booking.seat_category?.name) {
      return booking.seat_category.name;
    }
    
    if (booking.section?.section_name) {
      return booking.section.section_name;
    }
    
    return "General Section";
  };
  
  const { team1, team2, date, venue } = getMatchDetails();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <Card>
              <div className="p-6 space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find the booking information you're looking for.
          </p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ConfettiScript />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <RedBookMyShowLogo className="h-8" />
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4 bg-green-100 text-green-800 p-2 rounded-full">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Successful!</h1>
            <p className="text-gray-600">
              Your tickets have been reserved for {team1} vs {team2}
            </p>
          </div>
          
          <Card className="overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-ipl-blue to-ipl-purple p-1"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Booking Details</h2>
                <span className="text-sm font-medium text-gray-500">#{booking.id.substring(0, 8)}</span>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-ipl-blue bg-opacity-10 p-3 rounded-full">
                    <Ticket className="h-6 w-6 text-ipl-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{team1} vs {team2}</p>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 divide-y divide-gray-100">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium">{booking.name || user?.email}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium">{booking.email || booking.user_email || user?.email}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium">{booking.phone || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Section</span>
                    <span className="font-medium">{getSectionName()}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tickets</span>
                    <span className="font-medium">{booking.tickets || booking.quantity || 1}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold">₹{booking.total_amount}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {booking.status || "pending"}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Button 
                    className="bg-ipl-blue hover:bg-ipl-purple text-white flex-1" 
                    onClick={() => navigate('/')}
                  >
                    Book More Tickets
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => toast.success("Ticket details sent to your email!")}
                  >
                    <Download className="h-4 w-4" />
                    Download E-Ticket
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>Your booking confirmation has been sent to {booking.email || booking.user_email || user?.email}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Having issues with your booking?</p>
            <Button variant="link" onClick={() => navigate('/contact')}>Contact support</Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}

// Add this type declaration for window.confetti
declare global {
  interface Window {
    confetti: (options?: any) => void;
  }
}
