import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, Clock, Edit, Loader2, MoreHorizontal, Plus, MapPin, Trash2 } from "lucide-react";
import { format } from "date-fns";
import MatchForm from "@/components/admin/matches/MatchForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface SeatingCategory {
  id: string;
  name: string;
  price?: number;
  color_code?: string;
  description?: string;
}

export default function AdminMatches() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["admin-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          team1:team1_id(*),
          team2:team2_id(*),
          stadium:stadium_id(*)
        `)
        .order("match_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const createMatch = useMutation({
    mutationFn: async (matchData: any) => {
      setIsSubmitting(true);
      
      try {
        const { data: newMatch, error: matchError } = await supabase
          .from("matches")
          .insert({
            team1_id: matchData.team1_id,
            team2_id: matchData.team2_id,
            stadium_id: matchData.stadium_id,
            match_date: matchData.match_date,
            status: matchData.status,
            match_type: matchData.match_type,
          })
          .select()
          .single();
          
        if (matchError) throw matchError;
        
        if (matchData.seat_categories && matchData.seat_categories.length > 0) {
          const seatCategoryPromises = matchData.seat_categories.map(async (categoryId: string) => {
            const { data, error } = await supabase
              .from("seat_categories")
              .select("*")
              .eq("id", categoryId)
              .single();
              
            const category = data as SeatingCategory | null;
              
            if (category) {
              return supabase
                .from("seat_categories")
                .insert({
                  match_id: newMatch.id,
                  stadium_section_id: categoryId,
                  name: category.name || "General",
                  price: category.price || 999,
                  availability: 100,
                });
            }
          });
          
          await Promise.all(seatCategoryPromises);
        }
        
        return newMatch;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast.success("Match created successfully");
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
    },
    onError: (error) => {
      console.error("Error creating match:", error);
      toast.error("Failed to create match");
      setIsSubmitting(false);
    }
  });

  const updateMatch = useMutation({
    mutationFn: async (matchData: any) => {
      setIsSubmitting(true);
      
      try {
        const { data: updatedMatch, error: matchError } = await supabase
          .from("matches")
          .update({
            team1_id: matchData.team1_id,
            team2_id: matchData.team2_id,
            stadium_id: matchData.stadium_id,
            match_date: matchData.match_date,
            status: matchData.status,
            match_type: matchData.match_type,
          })
          .eq("id", selectedMatch.id)
          .select()
          .single();
          
        if (matchError) throw matchError;
        
        if (matchData.seat_categories && matchData.seat_categories.length > 0) {
          const { data: existingCategories } = await supabase
            .from("seat_categories")
            .select("id, stadium_section_id")
            .eq("match_id", selectedMatch.id);
            
          const existingCategoryIds = existingCategories?.map((cat: any) => cat.stadium_section_id) || [];
          
          const categoriesToAdd = matchData.seat_categories.filter(
            (id: string) => !existingCategoryIds.includes(id)
          );
          
          const categoriesToRemove = existingCategories?.filter(
            (cat: any) => !matchData.seat_categories.includes(cat.stadium_section_id)
          ).map((cat: any) => cat.id);
          
          if (categoriesToAdd.length > 0) {
            const addPromises = categoriesToAdd.map(async (categoryId: string) => {
              const { data, error } = await supabase
                .from("seat_categories")
                .select("*")
                .eq("id", categoryId)
                .single();
                
              const category = data as SeatingCategory | null;
                
              if (category) {
                return supabase
                  .from("seat_categories")
                  .insert({
                    match_id: selectedMatch.id,
                    stadium_section_id: categoryId,
                    name: category.name || "General",
                    price: category.price || 999,
                    availability: 100,
                  });
              }
            });
            
            await Promise.all(addPromises);
          }
          
          if (categoriesToRemove && categoriesToRemove.length > 0) {
            await supabase
              .from("seat_categories")
              .delete()
              .in("id", categoriesToRemove);
          }
        }
        
        return updatedMatch;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast.success("Match updated successfully");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
    },
    onError: (error) => {
      console.error("Error updating match:", error);
      toast.error("Failed to update match");
      setIsSubmitting(false);
    }
  });

  const deleteMatch = useMutation({
    mutationFn: async () => {
      if (!selectedMatch) throw new Error("No match selected");
      
      await supabase
        .from("seat_categories")
        .delete()
        .eq("match_id", selectedMatch.id);
        
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", selectedMatch.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Match deleted successfully");
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
    },
    onError: (error) => {
      console.error("Error deleting match:", error);
      toast.error("Failed to delete match");
    }
  });

  const handleCreateMatch = (data: any) => {
    createMatch.mutate(data);
  };

  const handleEditMatch = (data: any) => {
    updateMatch.mutate(data);
  };

  const handleDeleteMatch = () => {
    deleteMatch.mutate();
  };

  const prepareMatchForEdit = (match: any) => {
    const matchDate = new Date(match.match_date);
    const hours = matchDate.getHours().toString().padStart(2, "0");
    const minutes = matchDate.getMinutes().toString().padStart(2, "0");
    const matchTime = `${hours}:${minutes}`;
    
    return {
      ...match,
      match_time: matchTime
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500">Live</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-gray-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTeamName = (teamObj: any): string => {
    if (!teamObj) return "Unknown Team";
    
    if (typeof teamObj === 'object') {
      return teamObj.team_name || teamObj.name || "Unknown Team";
    }
    
    return String(teamObj) || "Unknown Team";
  };

  return (
    <AdminLayout pageTitle="Manage Matches">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Matches</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Match
          </Button>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches && matches.length > 0 ? (
                    matches.map((match) => {
                      const team1 = match.team1 || {};
                      const team2 = match.team2 || {};
                      
                      const team1Name = getTeamName(team1);
                      const team2Name = getTeamName(team2);
                      
                      const matchDate = new Date(match.match_date);
                      const formattedDate = format(matchDate, "dd MMM yyyy");
                      const formattedTime = format(matchDate, "h:mm a");
                      
                      return (
                        <TableRow key={match.id}>
                          <TableCell>
                            <div className="font-medium">
                              {team1Name} vs {team2Name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{formattedDate}</span>
                              <Clock className="h-4 w-4 ml-3 mr-2 text-gray-500" />
                              <span>{formattedTime}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{match.stadium?.name || "Unknown Venue"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(match.status)}</TableCell>
                          <TableCell>{match.match_type}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Calendar className="h-10 w-10 mb-2" />
                          <p className="text-lg">No matches found</p>
                          <p className="text-sm">Create a new match to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Match</DialogTitle>
            </DialogHeader>
            <MatchForm
              onSubmit={handleCreateMatch}
              isSubmitting={isSubmitting}
              buttonText="Create Match"
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Match</DialogTitle>
            </DialogHeader>
            {selectedMatch && (
              <MatchForm
                defaultValues={prepareMatchForEdit(selectedMatch)}
                onSubmit={handleEditMatch}
                isSubmitting={isSubmitting}
                title="Edit Match"
                buttonText="Save Changes"
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Match</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this match?</p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. All associated seat categories will also be deleted.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteMatch}
                disabled={deleteMatch.isPending}
              >
                {deleteMatch.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
