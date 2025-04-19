
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Team, Match } from "@/types/database";

interface MatchFormData {
  id?: string;
  team1_id: string;
  team2_id: string;
  venue?: string;
  match_date: string;
  match_type?: string;
  match_number?: number;
  status?: string;
  stadium_id?: string;
}

const initialFormData: MatchFormData = {
  team1_id: "",
  team2_id: "",
  venue: "",
  match_date: new Date().toISOString().split('T')[0],
  match_type: "league",
  status: "upcoming"
};

const AdminMatchesTab = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MatchFormData>(initialFormData);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["admin-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          team1_details:team1_id(*),
          team2_details:team2_id(*),
          stadium:stadium_id(*)
        `)
        .order("match_date");
      
      if (error) {
        toast.error("Failed to load matches", { description: error.message });
        throw error;
      }
      
      return data || [];
    }
  });

  const { data: stadiums } = useQuery({
    queryKey: ["admin-stadiums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stadiums")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["admin-teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("team_name");
      
      if (error) throw error;
      return data || [];
    }
  });

  const createMatch = useMutation({
    mutationFn: async (data: MatchFormData) => {
      const matchData = {
        team1_id: data.team1_id,
        team2_id: data.team2_id,
        match_date: data.match_date,
        venue: data.venue,
        stadium_id: data.stadium_id,
        status: data.status || "upcoming",
        match_type: data.match_type,
        match_number: data.match_number ? Number(data.match_number) : undefined
      };

      const { data: result, error } = await supabase
        .from("matches")
        .insert(matchData)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Match created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
      queryClient.invalidateQueries({ queryKey: ["admin-match-count"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to create match", { description: error.message });
    }
  });

  const updateMatch = useMutation({
    mutationFn: async (data: MatchFormData) => {
      const { id, ...updateData } = data;
      
      if (!id) {
        throw new Error("Match ID is required for updating");
      }
      
      // Convert match_number to number if provided
      const parsedMatchNumber = updateData.match_number ? 
        Number(updateData.match_number) : undefined;
      
      const { data: result, error } = await supabase
        .from("matches")
        .update({
          team1_id: updateData.team1_id, 
          team2_id: updateData.team2_id,
          match_date: updateData.match_date,
          venue: updateData.venue,
          stadium_id: updateData.stadium_id,
          status: updateData.status,
          match_type: updateData.match_type,
          match_number: parsedMatchNumber
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Match updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to update match", { description: error.message });
    }
  });

  const deleteMatch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Match deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
      queryClient.invalidateQueries({ queryKey: ["admin-match-count"] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete match", { description: error.message });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      match_date: new Date(formData.match_date).toISOString()
    };

    if (isEditing) {
      updateMatch.mutate(submissionData);
    } else {
      createMatch.mutate(submissionData);
    }
  };

  const editMatch = (match: any) => {
    setFormData({
      id: String(match.id),
      team1_id: String(match.team1_id || ""),
      team2_id: String(match.team2_id || ""),
      venue: match.venue || "",
      match_date: match.match_date ? 
        new Date(match.match_date).toISOString().split('T')[0] : 
        match.date ?
        new Date(match.date).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0],
      match_type: match.match_type || "league",
      match_number: match.match_number || undefined,
      status: match.status || "upcoming",
      stadium_id: match.stadium_id ? String(match.stadium_id) : undefined
    });

    setIsEditing(true);
    setIsCreating(false);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      deleteMatch.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setIsCreating(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsCreating(true);
    setIsOpen(true);
  };

  const getVenueName = (match: any): string => {
    if (match.stadium && match.stadium.name) {
      return match.stadium.name;
    }
    return match.venue || "No venue";
  };

  const getMatchStatus = (match: any): string => {
    return match.status || "upcoming";
  };

  const getTeamName = (team: any): string => {
    if (!team) return "Unknown Team";
    return team.team_name || team.name || "Unknown Team";
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
          <CardTitle>Matches</CardTitle>
          <CardDescription>
            Manage match schedule, teams, and venues
          </CardDescription>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button onClick={openCreateForm} className="bg-ipl-blue hover:bg-ipl-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-y-auto" aria-describedby="dialog-title">
            <SheetHeader>
              <SheetTitle id="sheet-title">{isEditing ? 'Edit Match' : 'Create New Match'}</SheetTitle>
              <SheetDescription>
                {isEditing ? 'Update match details' : 'Add a new match to the schedule'}
              </SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="team1-select">Team 1</Label>
                <select 
                  id="team1-select" 
                  name="team1_id" 
                  value={formData.team1_id} 
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Team 1"
                  autoComplete="off"
                >
                  <option value="">Select Team 1</option>
                  {teams?.map(team => (
                    <option key={`team1-${team.id}`} value={team.id}>
                      {team.team_name || team.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="team2-select">Team 2</Label>
                <select 
                  id="team2-select" 
                  name="team2_id" 
                  value={formData.team2_id} 
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Team 2"
                  autoComplete="off"
                >
                  <option value="">Select Team 2</option>
                  {teams?.map(team => (
                    <option key={`team2-${team.id}`} value={team.id}>
                      {team.team_name || team.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="stadium-select">Stadium</Label>
                <select 
                  id="stadium-select" 
                  name="stadium_id" 
                  value={formData.stadium_id || ""} 
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  aria-label="Select Stadium"
                  autoComplete="off"
                >
                  <option value="">Select Stadium</option>
                  {stadiums?.map(stadium => (
                    <option key={stadium.id} value={stadium.id}>
                      {stadium.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="venue-input">Venue</Label>
                <Input
                  id="venue-input"
                  name="venue"
                  value={formData.venue || ""}
                  onChange={handleInputChange}
                  placeholder="Enter venue"
                  required
                  autoComplete="address-level2"
                  aria-label="Match venue"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="date-input">Match Date</Label>
                <Input
                  id="date-input"
                  name="match_date"
                  type="date"
                  value={formData.match_date}
                  onChange={handleInputChange}
                  required
                  aria-label="Match date"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="match-type-select">Match Type</Label>
                <select 
                  id="match-type-select" 
                  name="match_type" 
                  value={formData.match_type || "league"} 
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  aria-label="Match type"
                  autoComplete="off"
                >
                  <option value="league">League</option>
                  <option value="playoff">Playoff</option>
                  <option value="semifinal">Semifinal</option>
                  <option value="final">Final</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="match-number-input">Match Number</Label>
                <Input
                  id="match-number-input"
                  name="match_number"
                  type="number"
                  value={formData.match_number || ""}
                  onChange={handleInputChange}
                  placeholder="Match number (optional)"
                  aria-label="Match number"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="status-select">Status</Label>
                <select 
                  id="status-select" 
                  name="status" 
                  value={formData.status || "upcoming"} 
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  aria-label="Match status"
                  autoComplete="off"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <SheetFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={createMatch.isPending || updateMatch.isPending}
                  className="w-full"
                  aria-label={isEditing ? "Update match" : "Create match"}
                >
                  {(createMatch.isPending || updateMatch.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? 'Update Match' : 'Create Match'}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teams</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden md:table-cell">Venue</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches && matches.length > 0 ? (
                matches.map((match: any) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <div className="font-medium">
                        {getTeamName(match.team1_details)} vs {getTeamName(match.team2_details)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        {match.match_date ? format(new Date(match.match_date), 'dd MMM yyyy') : 
                         (match.date ? format(new Date(match.date), 'dd MMM yyyy') : 'No date')}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getVenueName(match)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        getMatchStatus(match) === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                        getMatchStatus(match) === 'live' ? 'bg-green-100 text-green-800' : 
                        getMatchStatus(match) === 'completed' ? 'bg-gray-100 text-gray-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {getMatchStatus(match)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => editMatch(match)}
                          aria-label={`Edit match: ${getTeamName(match.team1_details)} vs ${getTeamName(match.team2_details)}`}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(match.id)}
                          className="text-red-500 hover:text-red-600"
                          aria-label={`Delete match: ${getTeamName(match.team1_details)} vs ${getTeamName(match.team2_details)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-gray-500">No matches found</p>
                    <Button 
                      variant="outline" 
                      onClick={openCreateForm} 
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first match
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminMatchesTab;
