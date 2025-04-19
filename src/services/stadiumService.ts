
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Stadium, StadiumSection } from "@/types/database";

export async function createStadium(stadium: Omit<Stadium, "id">): Promise<Stadium | null> {
  try {
    const { data, error } = await supabase
      .from("stadiums")
      .insert([stadium])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating stadium:", error);
      toast.error("Error creating stadium");
      return null;
    }

    toast.success("Stadium created successfully");
    return data as Stadium;
  } catch (error: any) {
    console.error("Failed to create stadium:", error.message || error);
    toast.error("Failed to create stadium");
    return null;
  }
}

export async function fetchStadiums(): Promise<Stadium[]> {
  try {
    const { data, error } = await supabase.from("stadiums").select("*");

    if (error) {
      console.error("Error fetching stadiums:", error);
      toast.error("Error loading stadiums");
      return [];
    }

    return data as Stadium[];
  } catch (error: any) {
    console.error("Failed to fetch stadiums:", error.message || error);
    toast.error("Failed to load stadiums");
    return [];
  }
}

export async function updateStadium(
  id: string,
  updates: Partial<Stadium>
): Promise<Stadium | null> {
  try {
    const { data, error } = await supabase
      .from("stadiums")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating stadium:", error);
      toast.error("Error updating stadium");
      return null;
    }

    toast.success("Stadium updated successfully");
    return data as Stadium;
  } catch (error: any) {
    console.error("Failed to update stadium:", error.message || error);
    toast.error("Failed to update stadium");
    return null;
  }
}

export async function deleteStadium(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("stadiums").delete().eq("id", id);

    if (error) {
      console.error("Error deleting stadium:", error);
      toast.error("Error deleting stadium");
      return false;
    }

    toast.success("Stadium deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Failed to delete stadium:", error.message || error);
    toast.error("Failed to delete stadium");
    return false;
  }
}

// Stadium Sections
export async function createStadiumSection(section: StadiumSection): Promise<StadiumSection | null> {
  try {
    // Fix the insert operation by generating a UUID for the id field
    // This ensures we meet the database requirement for the id field
    const { data, error } = await supabase
      .from("stadium_sections")
      .insert({
        id: crypto.randomUUID(), // Generate a UUID for the id field
        name: section.section_name || section.name || "",
        stadium_id: section.stadium_id
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating stadium section:", error);
      toast.error("Error creating stadium section");
      return null;
    }

    toast.success("Stadium section created successfully");
    return data as StadiumSection;
  } catch (error: any) {
    console.error("Failed to create stadium section:", error.message || error);
    toast.error("Failed to create stadium section");
    return null;
  }
}

export async function fetchStadiumSections(): Promise<StadiumSection[]> {
  try {
    const { data, error } = await supabase
      .from("stadium_sections")
      .select(`
        *,
        category:category_id(*)
      `);

    if (error) {
      console.error("Error fetching stadium sections:", error);
      toast.error("Error loading stadium sections");
      return [];
    }

    const processedData = data.map((section) => {
      // Use explicit type casting for safer property access
      const safeSection = section as Record<string, any>;
      const safeCategoryInfo = (safeSection.category || {}) as Record<string, any>;
      
      return {
        id: safeSection.id || "",
        stadium_id: safeSection.stadium_id || "",
        section_name: safeSection.name || "",
        name: safeSection.name || "",
        created_at: safeSection.created_at || "",
        updated_at: safeSection.updated_at || "",
        category: {
          id: safeCategoryInfo.id || "",
          name: safeCategoryInfo.name || "Standard",
          color_code: safeCategoryInfo.color_code || "#3b82f6",
        },
      } as StadiumSection;
    });

    return processedData;
  } catch (error: any) {
    console.error("Failed to fetch stadium sections:", error.message || error);
    toast.error("Failed to load stadium sections");
    return [];
  }
}

export async function updateStadiumSection(
  id: string,
  updates: Partial<StadiumSection>
): Promise<StadiumSection | null> {
  try {
    const dbUpdates = {
      name: updates.section_name || updates.name,
      stadium_id: updates.stadium_id
    };

    const { data, error } = await supabase
      .from("stadium_sections")
      .update(dbUpdates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating stadium section:", error);
      toast.error("Error updating stadium section");
      return null;
    }

    toast.success("Stadium section updated successfully");
    return data as StadiumSection;
  } catch (error: any) {
    console.error("Failed to update stadium section:", error.message || error);
    toast.error("Failed to update stadium section");
    return null;
  }
}

export async function deleteStadiumSection(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("stadium_sections").delete().eq("id", id);

    if (error) {
      console.error("Error deleting stadium section:", error);
      toast.error("Error deleting stadium section");
      return false;
    }

    toast.success("Stadium section deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Failed to delete stadium section:", error.message || error);
    toast.error("Failed to delete stadium section");
    return false;
  }
}

// Function to fetch stadium sections by stadium ID
export async function fetchSectionsByStadium(stadiumId: string): Promise<StadiumSection[]> {
  try {
    console.log("Fetching sections for stadium ID:", stadiumId);
    
    const { data, error } = await supabase
      .from("stadium_sections")
      .select(`
        *,
        category:category_id(*)
      `)
      .eq("stadium_id", stadiumId);

    if (error) {
      console.error("Error fetching stadium sections:", error);
      toast.error("Error loading stadium sections");
      return [];
    }

    console.log("Fetched sections:", data);

    const processedData = data.map((section) => {
      const safeSection = section as Record<string, any>;
      const safeCategoryInfo = (safeSection.category || {}) as Record<string, any>;
      
      return {
        id: safeSection.id || "",
        stadium_id: safeSection.stadium_id || "",
        section_name: safeSection.name || "",
        name: safeSection.name || "",
        created_at: safeSection.created_at || "",
        updated_at: safeSection.updated_at || "",
        category: {
          id: safeCategoryInfo.id || "",
          name: safeCategoryInfo.name || "Standard",
          color_code: safeCategoryInfo.color_code || "#3b82f6",
        },
      } as StadiumSection;
    });

    return processedData;
  } catch (error: any) {
    console.error("Failed to fetch stadium sections:", error.message || error);
    toast.error("Failed to load stadium sections");
    return [];
  }
}
