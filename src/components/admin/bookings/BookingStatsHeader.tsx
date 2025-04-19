
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const BookingStatsHeader = () => {
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [confirmedCount, setConfirmedCount] = useState<number>(0);
  
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["admin-bookings-stats"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            match:match_id(
              *,
              team1_details:team1_id(*),
              team2_details:team2_id(*),
              stadium:stadium_id(*)
            ),
            section:section_id(
              *
            )
          `)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching booking stats:", error);
        toast.error("Failed to load booking statistics");
        return [];
      }
    }
  });

  useEffect(() => {
    if (bookings && bookings.length > 0) {
      // Calculate totals
      let revenue = 0;
      let pending = 0;
      let confirmed = 0;
      
      bookings.forEach(booking => {
        // Safely parse total_amount, defaulting to 0 if undefined
        const bookingAmount = booking.total_amount ? parseFloat(String(booking.total_amount)) : 0;
        
        if (!isNaN(bookingAmount)) {
          revenue += bookingAmount;
        }
        
        if (booking.status === 'pending') {
          pending++;
        } else if (booking.status === 'confirmed') {
          confirmed++;
        }
      });
      
      setTotalRevenue(revenue);
      setPendingCount(pending);
      setConfirmedCount(confirmed);
    }
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-ipl-blue" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Failed to load booking statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {bookings?.length || 0}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            From {confirmedCount} confirmed bookings
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {pendingCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Require verification
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
