
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import AdminMatchesTab from "@/components/admin/tabs/AdminMatchesTab";
import AdminStadiumsTab from "@/components/admin/tabs/AdminStadiumsTab";
import AdminBookingsTab from "@/components/admin/tabs/AdminBookingsTab";
import { Loader2, UserCheck, Users, CalendarDays, Ticket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("matches");
  
  const { data: userCount, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });
  
  const { data: matchCount, isLoading: isLoadingMatches } = useQuery({
    queryKey: ["admin-match-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });
  
  const { data: bookingCount, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["admin-booking-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const isLoading = isLoadingUsers || isLoadingMatches || isLoadingBookings;

  return (
    <AdminLayout pageTitle="Admin Panel">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Welcome, {user?.email} - Manage your IPL ticket booking system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{userCount}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMatches ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{matchCount}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{bookingCount}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-auto w-full">
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="stadiums">Stadiums</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matches" className="space-y-4">
          <AdminMatchesTab />
        </TabsContent>
        
        <TabsContent value="stadiums" className="space-y-4">
          <AdminStadiumsTab />
        </TabsContent>
        
        <TabsContent value="bookings" className="space-y-4">
          <AdminBookingsTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminPanel;
