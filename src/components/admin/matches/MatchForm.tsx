import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Form schema
const matchFormSchema = z.object({
  team1_id: z.string().min(1, "Team 1 is required"),
  team2_id: z.string().min(1, "Team 2 is required"),
  stadium_id: z.string().min(1, "Stadium is required"),
  match_date: z.date({ required_error: "Match date is required" }),
  match_time: z.string().min(1, "Match time is required"),
  status: z.string().default("upcoming"),
  match_type: z.string().default("Regular"),
  seat_categories: z.array(z.string()).optional(),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

interface MatchFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isSubmitting?: boolean;
  title?: string;
  buttonText?: string;
}

// Define category type
interface SeatCategory {
  id: string;
  name: string;
  color_code?: string;
  price?: number;
  stadium_section_id?: string;
}

// Define team type
interface Team {
  id: string;
  team_name: string;
  name?: string;
}

// Define stadium type
interface Stadium {
  id: string;
  name: string;
  location?: string;
}

export default function MatchForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  title = "Create Match",
  buttonText = "Create Match"
}: MatchFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Fetch teams for dropdown
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, team_name");
        
      if (error) throw error;
      return data as Team[] || [];
    }
  });
  
  // Fetch stadiums for dropdown
  const { data: stadiums, isLoading: stadiumsLoading } = useQuery({
    queryKey: ["stadiums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stadiums")
        .select("id, name, location");
        
      if (error) throw error;
      return data as Stadium[] || [];
    }
  });
  
  // Fetch seat categories for multi-select
  const { data: seatCategories, isLoading: seatCategoriesLoading } = useQuery({
    queryKey: ["seat-categories-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seat_categories")
        .select("id, name, color_code, price");
        
      if (error) throw error;
      return data as SeatCategory[] || [];
    }
  });
  
  // Initialize form
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      team1_id: defaultValues?.team1_id || "",
      team2_id: defaultValues?.team2_id || "",
      stadium_id: defaultValues?.stadium_id || "",
      match_date: defaultValues?.match_date ? new Date(defaultValues.match_date) : undefined,
      match_time: defaultValues?.match_time || "16:00",
      status: defaultValues?.status || "upcoming",
      match_type: defaultValues?.match_type || "Regular",
      seat_categories: [],
    },
  });
  
  // Fetch existing seat categories for this match if editing
  useEffect(() => {
    if (defaultValues?.id) {
      const fetchExistingSeatCategories = async () => {
        const { data, error } = await supabase
          .from("seat_categories")
          .select("id, stadium_section_id")
          .eq("match_id", defaultValues.id);
          
        if (!error && data) {
          const categoryIds = data.map(item => item.stadium_section_id);
          setSelectedCategories(categoryIds);
          form.setValue("seat_categories", categoryIds);
        }
      };
      
      fetchExistingSeatCategories();
    }
  }, [defaultValues, form]);
  
  // Handle form submission
  const handleSubmitForm = async (values: MatchFormValues) => {
    try {
      // Combine date and time
      const date = new Date(values.match_date);
      const [hours, minutes] = values.match_time.split(":").map(Number);
      date.setHours(hours, minutes);
      
      // Prepare data for submission
      const matchData = {
        team1_id: values.team1_id,
        team2_id: values.team2_id,
        stadium_id: values.stadium_id,
        match_date: date.toISOString(),
        status: values.status,
        match_type: values.match_type,
      };
      
      // Call parent's onSubmit with the prepared data and selected categories
      onSubmit({ 
        ...matchData, 
        seat_categories: values.seat_categories || selectedCategories
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    }
  };

  // Remove a selected category
  const removeCategory = (categoryId: string) => {
    const updatedCategories = selectedCategories.filter(id => id !== categoryId);
    setSelectedCategories(updatedCategories);
    form.setValue("seat_categories", updatedCategories);
  };
  
  // Add a selected category
  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      const newCategories = [...selectedCategories, categoryId];
      setSelectedCategories(newCategories);
      form.setValue("seat_categories", newCategories);
    }
  };
  
  // Get category name by ID with safer type handling
  const getCategoryName = (categoryId: string) => {
    const category = seatCategories?.find(cat => cat.id === categoryId);
    return category?.name || "Unknown";
  };
  
  // Get category color by ID with safer type handling
  const getCategoryColor = (categoryId: string) => {
    const category = seatCategories?.find(cat => cat.id === categoryId);
    return category?.color_code || "#cccccc";
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="team1_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team 1</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={teamsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team 1" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamsLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Loading...</span>
                          </div>
                        ) : (
                          teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.team_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="team2_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team 2</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={teamsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team 2" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamsLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Loading...</span>
                          </div>
                        ) : (
                          teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.team_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="stadium_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stadium</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={stadiumsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stadium" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stadiumsLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading...</span>
                        </div>
                      ) : (
                        stadiums?.map((stadium) => (
                          <SelectItem key={stadium.id} value={stadium.id}>
                            {stadium.name}, {stadium.location}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="match_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Match Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="match_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Time</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-500" />
                      <Input 
                        type="time" 
                        {...field}
                        className="flex-1" 
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="match_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select match type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Playoff">Playoff</SelectItem>
                      <SelectItem value="Qualifier">Qualifier</SelectItem>
                      <SelectItem value="Eliminator">Eliminator</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Seat Categories</FormLabel>
              <FormDescription>
                Select seating categories available for this match
              </FormDescription>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCategories.map(categoryId => (
                  <Badge 
                    key={categoryId} 
                    variant="outline" 
                    style={{ backgroundColor: getCategoryColor(categoryId), color: '#fff' }}
                  >
                    {getCategoryName(categoryId)}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-2 text-white" 
                      onClick={() => removeCategory(categoryId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {seatCategoriesLoading ? (
                  <div className="col-span-2 flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  seatCategories?.map(category => (
                    <div 
                      key={category.id} 
                      className="flex items-center space-x-2 border p-2 rounded-md"
                    >
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addCategory(category.id);
                          } else {
                            removeCategory(category.id);
                          }
                        }}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm flex-1 flex items-center cursor-pointer"
                      >
                        <span 
                          className="w-3 h-3 rounded-full mr-2 inline-block" 
                          style={{ backgroundColor: category.color_code || '#ccc' }}
                        ></span>
                        {category.name} 
                        {category.price ? ` - ₹${category.price}` : ''}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
