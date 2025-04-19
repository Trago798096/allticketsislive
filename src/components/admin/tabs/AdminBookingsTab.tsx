
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { BookingFilters } from "../bookings/BookingFilters";
import { BookingsTable } from "../bookings/BookingsTable";
import { BookingDetailsDialog } from "../bookings/BookingDetailsDialog";
import { BookingStatsHeader } from "../bookings/BookingStatsHeader";
import { Booking } from "@/types/database";

const AdminBookingsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
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
            *,
            category:category_id(*)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        toast.error("Failed to load bookings", { description: error.message });
        throw error;
      }
      
      return data as Booking[];
    }
  });

  const filteredBookings = bookings?.filter((booking) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (booking.name && String(booking.name).toLowerCase().includes(searchLower)) ||
      (booking.email && String(booking.email).toLowerCase().includes(searchLower)) ||
      (booking.phone && String(booking.phone).toLowerCase().includes(searchLower)) ||
      (booking.utr && String(booking.utr).toLowerCase().includes(searchLower)) ||
      (booking.status && String(booking.status).toLowerCase().includes(searchLower))
    );
  });

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const exportBookingsCSV = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    try {
      const headers = [
        'Booking ID',
        'Customer Name',
        'Email',
        'Phone',
        'Match',
        'Venue',
        'Match Date',
        'Section',
        'Tickets',
        'Amount',
        'Status',
        'Booking Date',
      ].join(',');

      const rows = bookings.map(booking => [
        booking.id || booking.booking_id,
        booking.name || booking.user_name,
        booking.email || booking.user_email,
        booking.phone,
        `${booking.match?.team1_details?.name || 'Team 1'} vs ${booking.match?.team2_details?.name || 'Team 2'}`,
        booking.match?.stadium?.name || booking.match?.venue || 'N/A',
        booking.match?.match_date ? format(new Date(booking.match.match_date), 'dd MMM yyyy') : 'N/A',
        booking.section?.section_name || 'N/A',
        booking.tickets || booking.quantity || 0,
        booking.total_amount,
        booking.status,
        booking.created_at ? format(new Date(booking.created_at), 'dd MMM yyyy') : 'N/A',
      ].join(','));

      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ipl-bookings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Bookings exported successfully");
    } catch (error) {
      console.error("Error exporting bookings:", error);
      toast.error("Failed to export bookings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>View and manage ticket bookings</CardDescription>
        </div>

        <div className="flex items-center space-x-2">
          <BookingFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <Button 
            variant="outline" 
            size="sm"
            onClick={exportBookingsCSV}
            disabled={!bookings || bookings.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <BookingStatsHeader />
        
        <div className="mt-6">
          <BookingsTable 
            bookings={filteredBookings || []}
            onViewBooking={handleViewBooking}
          />
        </div>

        <BookingDetailsDialog
          booking={selectedBooking}
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
        />
      </CardContent>
    </Card>
  );
};

export default AdminBookingsTab;
