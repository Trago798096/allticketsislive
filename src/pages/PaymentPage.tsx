
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { withErrorLogging } from "@/utils/errorLogger";
import { UpiPayment } from "@/components/payment/UpiPayment";
import { createBooking } from "@/services/bookingService";
import { redirectIfNoBookingData, getBookingData } from "@/utils/navigationUtils";
import { PaymentMatchDetails } from "@/components/payment/PaymentMatchDetails";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { PaymentSummary } from "@/components/payment/PaymentSummary";
import { Loader2 } from "lucide-react";

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [upiId, setUpiId] = useState<string>("");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to complete your booking");
      // Save current path for redirect after login
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/auth");
      return;
    }
    
    // Check for booking data in session storage
    const storedData = getBookingData();
    if (storedData) {
      console.log("Retrieved booking data from session:", storedData);
      setBookingData(storedData);
      
      if (id && storedData.matchId && id !== storedData.matchId) {
        console.warn("URL match ID doesn't match booking data match ID");
      }
    } else {
      // If no booking data, check if we have an ID from the URL
      if (id) {
        // Try to load booking data from previous bookings (incomplete)
        fetchIncompleteBooking(id);
      } else {
        toast.error("No booking information found");
        navigate("/matches");
      }
    }
  }, [navigate, id, user]);

  // Function to fetch incomplete booking if navigating directly to payment page
  const fetchIncompleteBooking = async (matchId: string) => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("match_id", matchId)
        .eq("user_email", user.email)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        // Reconstruct booking data from incomplete booking
        const reconstructedData = {
          matchId: data.match_id,
          seatCategoryId: data.seat_category_id,
          name: data.name || user.user_metadata?.full_name || '',
          email: data.email || user.email,
          phone: data.phone || '',
          quantity: data.quantity || 1,
          totalAmount: data.total_amount || 0
        };
        
        setBookingData(reconstructedData);
        toast.info("Continuing with your previous booking");
      } else {
        toast.error("No booking information found");
        navigate("/matches");
      }
    } catch (error) {
      console.error("Error fetching incomplete booking:", error);
      toast.error("Failed to retrieve booking information");
      navigate("/matches");
    }
  };

  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: ["paymentMatch", bookingData?.matchId],
    queryFn: async () => {
      if (!bookingData?.matchId) return null;
      
      const {
        data,
        error
      } = await supabase.from("matches").select(`
          *,
          team1:team1_id(*),
          team2:team2_id(*),
          stadium:stadium_id(*)
        `).eq("id", bookingData.matchId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingData?.matchId,
  });

  const createBookingMutation = useMutation({
    mutationFn: withErrorLogging(async () => {
      if (!bookingData) {
        throw new Error("No booking data available");
      }

      if (!user?.email) {
        throw new Error("You must be logged in to complete booking");
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from("seat_categories")
        .select("stadium_section_id")
        .eq("id", bookingData.seatCategoryId)
        .single();
        
      if (categoryError) {
        throw new Error("Failed to verify seat category");
      }
      
      if (!categoryData) {
        throw new Error("Invalid seat category");
      }

      const booking = {
        match_id: bookingData.matchId,
        user_email: user.email,
        user_name: bookingData.name,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        seat_category_id: bookingData.seatCategoryId,
        section_id: categoryData.stadium_section_id,
        quantity: bookingData.quantity,
        tickets: bookingData.quantity,
        total_amount: bookingData.totalAmount,
        payment_method: paymentMethod,
        upi_id: upiId,
        utr_number: utrNumber,
        utr: utrNumber,
        status: "pending"
      };

      console.log("Creating booking with payload:", booking);
      
      const result = await createBooking(booking);
      return result;
    }, "createBooking"),
    onSuccess: (data) => {
      if (!data || typeof data !== 'object' || !('id' in data)) {
        toast.error("Failed to create booking: Invalid response data");
        setIsSubmitting(false);
        return;
      }
      
      toast.success("Booking created successfully!");
      sessionStorage.setItem("confirmationData", JSON.stringify(data));
      
      // Clear booking data from session storage
      sessionStorage.removeItem("bookingData");
      
      // Navigate to success page
      navigate(`/booking/success/${data.id}`);
    },
    onError: (error: any) => {
      console.error("Failed to create booking:", error);
      toast.error("Booking failed: " + (error.message || "Unknown error"));
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!upiId || !utrNumber) {
      toast.error("Please provide UPI ID and UTR number");
      setIsSubmitting(false);
      return;
    }

    try {
      await createBookingMutation.mutateAsync({});
    } catch (error) {
      console.error("Payment submission error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Complete Payment</h1>
            <p className="text-gray-500">
              Pay to confirm your match tickets
            </p>
          </div>
          
          {isLoadingMatch ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <PaymentMatchDetails match={match} />
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                  <PaymentMethodSelector 
                    selectedMethod={paymentMethod} 
                    onMethodChange={setPaymentMethod} 
                  />
                  
                  <div className="mt-6">
                    {paymentMethod === "upi" && (
                      <UpiPayment 
                        amount={bookingData?.totalAmount || 0} 
                        onUtrSubmit={(utrId, userUpiId) => {
                          setUpiId(userUpiId);
                          setUtrNumber(utrId);
                        }}
                        isProcessing={isSubmitting}
                        upiId={upiId}
                        utrNumber={utrNumber}
                        onUpiIdChange={setUpiId}
                        onUtrNumberChange={setUtrNumber}
                      />
                    )}
                  </div>
                </div>
                
                <Alert className="mt-6">
                  <AlertDescription className="text-xs text-muted-foreground">
                    For demo purposes, you can use any UPI ID and UTR number to complete the booking
                  </AlertDescription>
                </Alert>
              </div>
              
              <div>
                <PaymentSummary
                  bookingData={bookingData}
                  isSubmitting={isSubmitting}
                  paymentMethod={paymentMethod}
                  upiId={upiId}
                  utrNumber={utrNumber}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentPage;
