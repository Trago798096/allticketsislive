
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchUserBookings } from "@/services/bookingService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Ticket, Phone, Mail, MapPin } from "lucide-react";
import { format } from "date-fns";
import { UserProfile as UserProfileType } from "@/types/database";

const profileSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }).optional().nullable(),
  address: z.string().optional().nullable(),
});

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings", user?.email],
    queryFn: () => fetchUserBookings(user?.email || ""),
    enabled: !!user?.email,
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data as Partial<UserProfileType>);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-ipl-blue to-ipl-purple bg-clip-text text-transparent">
            My Profile
          </h1>
          
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="w-full max-w-md grid grid-cols-2 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User size={16} />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Ticket size={16} />
                <span>My Bookings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input value={user?.email || ""} disabled />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+91 9876543210" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Cricket Street, Mumbai" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-ipl-blue to-ipl-purple hover:opacity-90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>
                    View all your match ticket bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBookings ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" />
                    </div>
                  ) : !bookings || bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <Ticket className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                      <p className="text-gray-500">You haven't booked any tickets yet.</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <a href="/matches">Browse Matches</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <div className="font-semibold">{booking.match_id}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <User size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-600">{booking.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Ticket size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-600">{booking.tickets} tickets</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Phone size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-600">{booking.phone}</span>
                              </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:text-right">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status.toUpperCase()}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {booking.created_at && format(new Date(booking.created_at), "MMM dd, yyyy")}
                              </div>
                              <div className="text-sm font-medium text-ipl-blue mt-1">
                                {booking.total_amount ? `₹${booking.total_amount}` : "Price unavailable"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
