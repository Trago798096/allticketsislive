import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivitySquare, CalendarDays, CreditCard, Users } from "lucide-react";
import { format, subDays } from "date-fns";

// Remove Chart.js and react-charts imports since they're causing errors
// We'll simplify the dashboard to not use charts for now

const AdminDashboard = () => {
  // Fetch match count
  const { data: matchCount, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["admin-match-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("matches")
        .select("*", { count: "exact" });

      if (error) {
        console.error("Error fetching match count:", error);
        return 0;
      }

      return count || 0;
    },
  });

  // Fetch upcoming matches
  const { data: upcomingMatches, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["admin-upcoming-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .gte("match_date", new Date().toISOString())
        .order("match_date")
        .limit(5);

      if (error) {
        console.error("Error fetching upcoming matches:", error);
        return [];
      }

      return data || [];
    },
  });

  // Fetch recent bookings - use simplified query to avoid column errors
  const { data: recentBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["admin-recent-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching recent bookings:", error);
        return [];
      }

      return data || [];
    },
  });

  // Calculate total revenue - just use booking count as placeholder
  const bookingCount = recentBookings?.length || 0;
  const totalRevenue = bookingCount * 1000; // Placeholder calculation

  // Handle loading states
  if (isLoadingMatches || isLoadingBookings) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <div className="p-8 text-center">
          <p>Loading dashboard data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <CalendarDays className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchCount}</div>
            <p className="text-sm text-gray-500">
              {upcomingMatches?.length} upcoming
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue}</div>
            <p className="text-sm text-gray-500">
              {bookingCount} recent bookings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <ActivitySquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Revenue visualization is currently unavailable
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {upcomingMatches?.map((match) => (
                <li key={match.id} className="py-2 border-b">
                  {match.team1_id} vs {match.team2_id} -{" "}
                  {format(new Date(match.match_date), "dd MMM yyyy")}
                </li>
              ))}
              {upcomingMatches?.length === 0 && (
                <li className="text-gray-500 text-center py-4">
                  No upcoming matches
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
