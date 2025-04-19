
import { Booking } from "@/types/database";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTeamInfo } from "@/utils/teamUtils";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBookingStatus } from "@/services/bookingService";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingDetailsDialog = ({ booking, isOpen, onClose }: BookingDetailsDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  
  const getStatusColor = (status: string | undefined) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': 
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return updateBookingStatus(id, status);
    },
    onSuccess: () => {
      toast.success("Booking status updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin-bookings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-bookings-stats"],
      });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error("Failed to update booking status", {
        description: error instanceof Error ? error.message : "Please try again"
      });
      setIsUpdating(false);
    }
  });

  const handleStatusChange = async (status: string) => {
    if (!booking?.id) return;
    
    setIsUpdating(true);
    statusMutation.mutate({ id: booking.id, status });
  };

  if (!booking) return null;

  const getTeamName = (teamDetails: any | null, fallbackName: string): string => {
    if (!teamDetails) return String(fallbackName);
    if (typeof teamDetails === 'object' && teamDetails !== null) {
      return getTeamInfo(teamDetails).name || fallbackName;
    }
    return String(fallbackName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Booking Details</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>Status:</span> 
            <Badge className={getStatusColor(booking.status)}>
              {booking.status || 'Unknown'}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Customer</h4>
            <p className="font-medium">{booking.name || booking.user_name}</p>
            <p className="text-sm">{booking.email || booking.user_email}</p>
            <p className="text-sm">{booking.phone}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Booking ID</h4>
              <p className="font-mono text-sm">{booking.id || booking.booking_id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
              <p className="text-sm">
                {booking.created_at ? format(new Date(booking.created_at), 'dd MMM yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          {booking.match && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Match Details</h4>
              <p className="font-medium">
                {getTeamName(booking.match?.team1_details, 'Team 1')} vs {getTeamName(booking.match?.team2_details, 'Team 2')}
              </p>
              <p className="text-sm">
                {booking.match?.stadium?.name || booking.match?.venue || 'N/A'}
              </p>
              <p className="text-sm">
                {booking.match?.match_date ? format(new Date(booking.match.match_date), 'dd MMM yyyy, HH:mm') : 'N/A'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Tickets</h4>
              <p className="font-medium">{booking.tickets || booking.quantity || 0}</p>
              <p className="text-sm">{booking.section?.section_name || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Payment</h4>
              <p className="font-medium">₹{booking.total_amount?.toLocaleString() || '0'}</p>
              <p className="text-sm">UTR: {booking.utr || booking.utr_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2">
            {booking.status !== "confirmed" && (
              <Button 
                variant="success"
                size="sm"
                onClick={() => handleStatusChange("confirmed")}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm
              </Button>
            )}
            
            {booking.status !== "cancelled" && booking.status !== "canceled" && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleStatusChange("cancelled")}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Cancel
              </Button>
            )}
          </div>
          
          <Button variant="outline" onClick={onClose} size="sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
