
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Team } from "@/types/database";

export async function createTeam(team: Omit<Team, "id">): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .insert([team])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating team:", error);
      toast.error("टीम बनाने में त्रुटि हुई");
      return null;
    }

    toast.success("टीम सफलतापूर्वक बनाई गई");
    return data as Team;
  } catch (error: any) {
    console.error("Failed to create team:", error.message || error);
    toast.error("टीम बनाने में विफल");
    return null;
  }
}

export async function fetchTeams(): Promise<Team[]> {
  try {
    const { data, error } = await supabase.from("teams").select("*");

    if (error) {
      console.error("Error fetching teams:", error);
      toast.error("टीमों को लोड करने में त्रुटि हुई");
      return [];
    }

    return data as Team[];
  } catch (error: any) {
    console.error("Failed to fetch teams:", error.message || error);
    toast.error("टीमों को लोड करने में विफल");
    return [];
  }
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating team:", error);
      toast.error("टीम को अपडेट करने में त्रुटि हुई");
      return null;
    }

    toast.success("टीम सफलतापूर्वक अपडेट की गई");
    return data as Team;
  } catch (error: any) {
    console.error("Failed to update team:", error.message || error);
    toast.error("टीम को अपडेट करने में विफल");
    return null;
  }
}

export async function deleteTeam(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) {
      console.error("Error deleting team:", error);
      toast.error("टीम को हटाने में त्रुटि हुई");
      return false;
    }

    toast.success("टीम सफलतापूर्वक हटा दी गई");
    return true;
  } catch (error: any) {
    console.error("Failed to delete team:", error.message || error);
    toast.error("टीम को हटाने में विफल");
    return false;
  }
}
