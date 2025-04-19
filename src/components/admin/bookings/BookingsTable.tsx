
import { Booking } from "@/types/database";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeamInfo } from "@/utils/teamUtils";

interface BookingsTableProps {
  bookings: Booking[];
  onViewBooking: (booking: Booking) => void;
}

export const BookingsTable = ({ bookings, onViewBooking }: BookingsTableProps) => {
  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamName = (teamDetails: any | null, fallbackName: string): string => {
    if (!teamDetails) return String(fallbackName);
    if (typeof teamDetails === 'object' && teamDetails !== null) {
      return getTeamInfo(teamDetails).name || fallbackName;
    }
    return String(fallbackName);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Match</TableHead>
            <TableHead className="hidden md:table-cell">Tickets</TableHead>
            <TableHead className="hidden lg:table-cell">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow key={booking.id || booking.booking_id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.name || booking.user_name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[150px]">
                      {booking.email || booking.user_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {getTeamName(booking.match?.team1_details, 'Team 1')} vs{' '}
                      {getTeamName(booking.match?.team2_details, 'Team 2')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.match?.stadium?.name || booking.match?.venue || 'Unknown venue'}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {booking.tickets || booking.quantity || 0}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  ₹{booking.total_amount?.toLocaleString() || '0'}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeStyle(booking.status || '')}`}>
                    {booking.status || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {booking.created_at ? format(new Date(booking.created_at), 'dd MMM yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onViewBooking(booking)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <p className="text-gray-500">No bookings found</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
