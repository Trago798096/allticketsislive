
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchUserBookings } from "@/services/bookingService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Info } from "lucide-react";
import { format } from "date-fns";
import { Booking } from "@/types/database";

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user && user.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["user-bookings", userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return await fetchUserBookings(userEmail);
    },
    enabled: !!userEmail,
  });

  const filteredBookings = bookings?.filter((booking: Booking) => {
    if (activeTab === "all") return true;
    // Use optional chaining to safely access status
    return booking?.status === activeTab;
  });

  const getStatusCount = (status: string) => {
    return bookings?.filter((booking: Booking) => booking?.status === status).length || 0;
  };

  const getBadgeColor = (status: string | undefined) => {
    switch (status) {
      case "confirmed":
        return 'bg-green-100 text-green-800';
      case "pending":
        return 'bg-yellow-100 text-yellow-800';
      case "cancelled":
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamName = (booking: Booking, teamType: 'team1' | 'team2') => {
    if (!booking.match) return teamType === 'team1' ? 'Team 1' : 'Team 2';
    
    const teamIdField = teamType === 'team1' ? 'team1_id' : 'team2_id';
    const teamDetailsField = teamType === 'team1' ? 'team1_details' : 'team2_details';
    
    const teamDetails = booking.match[teamDetailsField];
    const teamId = booking.match[teamIdField];
    
    if (!teamDetails) {
      return teamType === 'team1' ? 
        (teamId || 'Team 1') : 
        (teamId || 'Team 2');
    }
    
    if (typeof teamDetails === 'object' && 'error' in teamDetails) {
      return teamType === 'team1' ? 
        String(teamId || 'Team 1') : 
        String(teamId || 'Team 2');
    }
    
    if (typeof teamDetails === 'object' && ('name' in teamDetails || 'team_name' in teamDetails)) {
      return String((teamDetails.team_name || teamDetails.name) || (teamType === 'team1' ? 'Team 1' : 'Team 2'));
    }
      
    return teamType === 'team1' ? String(teamId || 'Team 1') : String(teamId || 'Team 2');
  };

  const handleShowDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-ipl-blue to-ipl-purple bg-clip-text text-transparent mb-6">
          My Bookings
        </h1>

        {!user ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h2 className="text-xl font-medium mb-2">Sign in to view your bookings</h2>
              <p className="text-gray-500 mb-4">You need to be signed in to view your booking history.</p>
              <Button>Sign In</Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading your bookings...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h2 className="text-xl font-medium text-red-600 mb-2">Failed to load bookings</h2>
                <p className="text-gray-500">There was an error loading your bookings. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        ) : bookings && bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-2">No bookings found</h2>
                <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                <Button>Book Tickets Now</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Your Booking History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
                  <TabsTrigger value="all">
                    All
                    <span className="ml-1 text-xs bg-gray-200 text-gray-800 rounded-full px-1.5 py-0.5">
                      {bookings?.length || 0}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="confirmed">
                    Confirmed
                    <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-1.5 py-0.5">
                      {getStatusCount("confirmed")}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending
                    <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 rounded-full px-1.5 py-0.5">
                      {getStatusCount("pending")}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="cancelled">
                    Cancelled
                    <span className="ml-1 text-xs bg-red-100 text-red-800 rounded-full px-1.5 py-0.5">
                      {getStatusCount("cancelled")}
                    </span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Match</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead>Tickets</TableHead>
                          <TableHead className="hidden md:table-cell">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings?.map((booking: Booking) => (
                          <TableRow key={booking.booking_id || booking.id}>
                            <TableCell className="font-mono">
                              {String(booking.booking_id || booking.id || "").substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {getTeamName(booking, 'team1')} vs {getTeamName(booking, 'team2')}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {booking.created_at &&
                                format(new Date(booking.created_at), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>{booking.tickets || booking.quantity || 0}</TableCell>
                            <TableCell className="hidden md:table-cell">₹{booking.total_amount || 0}</TableCell>
                            <TableCell>
                              <Badge className={getBadgeColor(booking.status)}>
                                {(booking.status || 'PENDING').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShowDetails(booking)}
                              >
                                <Info className="mr-1 h-4 w-4" />
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {selectedBooking && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>
                  Booking ID: {String(selectedBooking.id || selectedBooking.booking_id).substring(0, 8)}...
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="border rounded-md p-4 space-y-2">
                  <h3 className="font-semibold">Match Information</h3>
                  <p>
                    {getTeamName(selectedBooking, 'team1')} vs {getTeamName(selectedBooking, 'team2')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.match?.venue}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBooking.match?.match_date && 
                      format(new Date(selectedBooking.match.match_date), "dd MMM yyyy")}
                    {!selectedBooking.match?.match_date && selectedBooking.match?.date && 
                      format(new Date(selectedBooking.match.date), "dd MMM yyyy")}
                  </p>
                </div>

                <div className="border rounded-md p-4 space-y-2">
                  <h3 className="font-semibold">Ticket Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-600">Tickets</div>
                    <div>{selectedBooking.tickets || selectedBooking.quantity || 0}</div>
                    <div className="text-sm text-gray-600">Section</div>
                    <div>{selectedBooking.section?.section_name || "General"}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                    <div>₹{selectedBooking.total_amount || 0}</div>
                    <div className="text-sm text-gray-600">UTR</div>
                    <div className="font-mono">{selectedBooking.utr || selectedBooking.utr_number || "N/A"}</div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div>
                      <Badge className={getBadgeColor(selectedBooking.status)}>
                        {(selectedBooking.status || 'PENDING').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookingsPage;
