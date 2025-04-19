
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/database';
import { formatDate } from '@/utils/dateUtils';
import { getTeamInfo } from '@/utils/teamUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, Search, Eye, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            match:match_id(
              *,
              team1:team1_id(*),
              team2:team2_id(*)
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching bookings:", error);
          throw error;
        }
        
        return data as Booking[];
      } catch (error) {
        console.error("Error in fetchBookings:", error);
        throw error;
      }
    },
    retry: 1
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Error updating booking status:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Booking status updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update booking status");
      console.error("Error updating booking status:", error);
    }
  });

  const handleApprove = (id: string) => {
    updateBookingStatus.mutate({ id, status: 'confirmed' });
  };

  const handleReject = (id: string) => {
    updateBookingStatus.mutate({ id, status: 'rejected' });
  };

  const filteredBookings = bookings?.filter(booking => {
    const matchesStatus = booking.status === activeTab;
    
    if (!searchTerm) return matchesStatus;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      matchesStatus &&
      (booking.name?.toLowerCase().includes(searchLower) ||
        booking.email?.toLowerCase().includes(searchLower) ||
        booking.phone?.toLowerCase().includes(searchLower) ||
        booking.utr?.toLowerCase().includes(searchLower) ||
        booking.id?.toLowerCase().includes(searchLower))
    );
  });

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertCircle className="text-red-500 h-8 w-8" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error loading bookings</h3>
                <p className="text-red-600">
                  There was a problem loading the booking data. Please try refreshing the page.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="ml-auto" 
                onClick={() => refetch()}
                aria-label="Retry loading bookings"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Manage Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                <Search className="text-gray-400" />
                <Input
                  id="booking-search"
                  name="booking-search"
                  placeholder="Search by name, email, phone, UTR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                  aria-label="Search bookings"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="pending">
              <TabsList className="mb-6">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  Pending
                  <Badge variant="outline" className="ml-1">
                    {bookings?.filter(b => b.status === 'pending').length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="flex items-center gap-2">
                  Confirmed
                  <Badge variant="outline" className="ml-1">
                    {bookings?.filter(b => b.status === 'confirmed').length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-2">
                  Rejected
                  <Badge variant="outline" className="ml-1">
                    {bookings?.filter(b => b.status === 'rejected').length || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0" role="tabpanel">
                {isLoading ? (
                  <div className="py-8 text-center" aria-live="polite">
                    <p>Loading bookings...</p>
                  </div>
                ) : filteredBookings && filteredBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Match</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>UTR</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => {
                          const matchDetails = booking.match;
                          let team1 = { name: 'Team 1' };
                          let team2 = { name: 'Team 2' };
                          
                          if (matchDetails?.team1) {
                            team1 = getTeamInfo(matchDetails.team1);
                          }
                          
                          if (matchDetails?.team2) {
                            team2 = getTeamInfo(matchDetails.team2);
                          }
                          
                          const matchName = `${team1.name} vs ${team2.name}`;
                          const bookingIdShort = booking.id?.substring(0, 8) || '';

                          return (
                            <TableRow key={booking.id}>
                              <TableCell className="font-mono text-xs">
                                {bookingIdShort}...
                              </TableCell>
                              <TableCell>{matchName}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{booking.name || 'N/A'}</p>
                                  <p className="text-sm text-gray-500">{booking.email || 'N/A'}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono">{booking.utr || 'N/A'}</span>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ₹{booking.total_amount || 0}
                              </TableCell>
                              <TableCell>
                                {formatDate(booking.created_at || '', false)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center gap-2">
                                  {booking.status === 'pending' && (
                                    <>
                                      <Button 
                                        onClick={() => handleApprove(booking.id)} 
                                        size="sm" 
                                        variant="outline" 
                                        className="w-8 h-8 p-0 bg-green-50 border-green-200 hover:bg-green-100"
                                        aria-label={`Approve booking ${bookingIdShort}`}
                                      >
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button 
                                        onClick={() => handleReject(booking.id)} 
                                        size="sm" 
                                        variant="outline" 
                                        className="w-8 h-8 p-0 bg-red-50 border-red-200 hover:bg-red-100"
                                        aria-label={`Reject booking ${bookingIdShort}`}
                                      >
                                        <X className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-8 h-8 p-0"
                                    onClick={() => window.open(`/admin/booking/${booking.id}`, '_blank')}
                                    aria-label={`View booking details for ${bookingIdShort}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8" aria-live="polite" role="status">
                    <p className="text-gray-500">No {activeTab} bookings found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
