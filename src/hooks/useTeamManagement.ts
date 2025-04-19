
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Team } from "@/types/database";
import { TeamFormValues } from "@/types/forms";
import { fetchTeams, createTeam, updateTeam, deleteTeam } from "@/services/adminService";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useTeamManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    enabled: !!session, // Only fetch teams when authenticated
  });

  // Helper function to handle file uploads
  const uploadFile = async (file: File, path: string): Promise<string> => {
    // Create a FormData instance to upload the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Get file extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    try {
      // Use the Supabase client directly to upload
      const { data: supabaseData, error } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Error uploading file");
    }
  };

  const handleCreateTeam = async (data: TeamFormValues, logoFile: File | null) => {
    if (!session) {
      toast.error("You must be logged in to create a team");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let logoUrl = "";
      
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, "teams");
      }
      
      const teamData = {
        team_name: data.name,
        short_name: data.short_name,
        logo: logoUrl,
        logo_url: logoUrl,
        established_year: data.established_year,
        description: data.description ?? undefined,
        home_venue: data.home_venue ?? undefined
      };
      
      await createTeam(teamData);
      
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created successfully");
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTeam = async (data: TeamFormValues, logoFile: File | null) => {
    if (!selectedTeam || !session) return;
    
    setIsSubmitting(true);
    
    try {
      let logoUrl = selectedTeam.logo || selectedTeam.logo_url || '';
      
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, "teams");
      }
      
      const teamData = {
        team_name: data.name,
        short_name: data.short_name,
        logo: logoUrl,
        logo_url: logoUrl,
        established_year: data.established_year,
        description: data.description ?? undefined,
        home_venue: data.home_venue ?? undefined
      };
      
      await updateTeam(selectedTeam.id, teamData);
      
      setSelectedTeam(null);
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team updated successfully");
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Failed to update team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam || !session) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteTeam(selectedTeam.id);
      setSelectedTeam(null);
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted successfully");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  return {
    teams,
    isLoading,
    selectedTeam,
    isSubmitting,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleCreateTeam,
    handleEditTeam,
    handleDeleteTeam,
    openEditDialog,
    openDeleteDialog
  };
}
