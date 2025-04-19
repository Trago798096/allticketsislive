
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SeatingCategory, SeatCategory } from "@/types/database";
import { v4 as uuidv4 } from 'uuid';

// Seating Categories
export async function createSeatingCategory(
  category: SeatingCategory
): Promise<SeatingCategory | null> {
  try {
    if (!category.match_id || !category.name) {
      toast.error("Required fields are missing in seating category");
      return null;
    }
    
    // Generate UUID if not provided
    const id = category.id || uuidv4();
    
    const categoryToInsert = {
      id,
      name: category.name,
      description: category.description || "",
      color_code: category.color_code || "#3b82f6",
      price: category.price || 0,
      match_id: category.match_id,
      stadium_section_id: category.stadium_section_id || "",
      availability: category.availability || 100
    };
    
    console.log("Inserting seating category:", categoryToInsert);
    
    const { data, error } = await supabase
      .from("seat_categories")
      .insert(categoryToInsert)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating seating category:", error);
      toast.error("Error creating seating category: " + error.message);
      return null;
    }

    toast.success("Seating category created successfully");
    return data as SeatingCategory;
  } catch (error: any) {
    console.error("Failed to create seating category:", error.message || error);
    toast.error("Failed to create seating category");
    return null;
  }
}

export async function fetchSeatingCategories(): Promise<SeatingCategory[]> {
  try {
    const { data, error } = await supabase
      .from("seat_categories")
      .select("*");

    if (error) {
      console.error("Error fetching seating categories:", error);
      toast.error("Error loading seating categories");
      return [];
    }

    return data as SeatingCategory[];
  } catch (error: any) {
    console.error("Failed to fetch seating categories:", error.message || error);
    toast.error("Failed to load seating categories");
    return [];
  }
}

export async function updateSeatingCategory(
  id: string,
  updates: Partial<SeatingCategory>
): Promise<SeatingCategory | null> {
  try {
    console.log("Updating seating category:", id, updates);
    
    // Filter out undefined values and prepare the update data
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.match_id !== undefined) dbUpdates.match_id = updates.match_id;
    if (updates.stadium_section_id !== undefined) dbUpdates.stadium_section_id = updates.stadium_section_id;
    if (updates.section_id !== undefined) dbUpdates.stadium_section_id = updates.section_id;
    if (updates.color_code !== undefined) dbUpdates.color_code = updates.color_code;

    // Ensure we have the ID in the update object
    dbUpdates.id = id;

    console.log("Final update object:", dbUpdates);

    const { data, error } = await supabase
      .from("seat_categories")
      .upsert(dbUpdates, {
        onConflict: 'id'
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error updating seating category:", error);
      toast.error("Error updating seating category: " + error.message);
      return null;
    }

    toast.success("Seating category updated successfully");
    return data as SeatingCategory;
  } catch (error: any) {
    console.error("Failed to update seating category:", error.message || error);
    toast.error("Failed to update seating category");
    return null;
  }
}

export async function deleteSeatingCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("seat_categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting seating category:", error);
      toast.error("Error deleting seating category");
      return false;
    }

    toast.success("Seating category deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Failed to delete seating category:", error.message || error);
    toast.error("Failed to delete seating category");
    return false;
  }
}

// Seat Categories
export async function createSeatCategory(
  seatCategory: Omit<SeatCategory, "id">
): Promise<SeatCategory | null> {
  try {
    if (!seatCategory.match_id || !seatCategory.stadium_section_id) {
      toast.error("Required fields missing for seat category");
      return null;
    }
    
    // Generate UUID for new category
    const id = uuidv4();
    
    const seatCategoryData = {
      id,
      match_id: seatCategory.match_id,
      stadium_section_id: seatCategory.stadium_section_id,
      name: seatCategory.name || "General",
      price: seatCategory.price || 0,
      availability: seatCategory.availability || 100,
      color_code: seatCategory.color_code || "#3b82f6"
    };
    
    console.log("Creating seat category:", seatCategoryData);

    const { data, error } = await supabase
      .from("seat_categories")
      .insert(seatCategoryData)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating seat category:", error);
      toast.error("Error creating seat category: " + error.message);
      return null;
    }

    toast.success("Seat category created successfully");
    return data as SeatCategory;
  } catch (error: any) {
    console.error("Failed to create seat category:", error.message || error);
    toast.error("Failed to create seat category");
    return null;
  }
}

export async function fetchSeatCategories(): Promise<SeatCategory[]> {
  try {
    const { data, error } = await supabase.from("seat_categories").select(`
      *,
      section:stadium_section_id(
        *,
        category:category_id(*)
      )
    `);

    if (error) {
      console.error("Error fetching seat categories:", error);
      toast.error("Error loading seat categories");
      return [];
    }

    return data.map((category) => {
      const safeSeatCategory = category as Record<string, any>;
      const safeSection = safeSeatCategory.section ? safeSeatCategory.section as Record<string, any> : {};
      const safeCategory = safeSection.category ? safeSection.category as Record<string, any> : {};
      
      return {
        ...safeSeatCategory,
        section_id: safeSeatCategory.stadium_section_id || "",
        section_name: safeSection.name || "Unknown Section",
        category_name: safeCategory.name || "Standard",
        color_code: safeSeatCategory.color_code || safeCategory.color_code || "#3b82f6",
        section: {
          id: safeSection.id || "",
          stadium_id: safeSection.stadium_id || "",
          section_name: safeSection.name || "Unknown Section",
          name: safeSection.name || "Unknown Section",
          category: {
            name: safeCategory.name || "Standard",
            color_code: safeCategory.color_code || "#3b82f6",
            id: safeCategory.id || ""
          }
        }
      } as SeatCategory;
    });
  } catch (error: any) {
    console.error("Failed to fetch seat categories:", error.message || error);
    toast.error("Failed to load seat categories");
    return [];
  }
}

export async function updateSeatCategory(
  id: string,
  updates: Partial<SeatCategory>
): Promise<SeatCategory | null> {
  try {
    console.log("Updating seat category with ID:", id, "Updates:", updates);
    
    // Filter out undefined values and prepare the update data
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.match_id !== undefined) dbUpdates.match_id = updates.match_id;
    if (updates.stadium_section_id !== undefined) dbUpdates.stadium_section_id = updates.stadium_section_id;
    if (updates.section_id !== undefined) dbUpdates.stadium_section_id = updates.section_id;
    if (updates.color_code !== undefined) dbUpdates.color_code = updates.color_code;

    // Ensure the ID is included
    dbUpdates.id = id;
    
    console.log("Final update object for seat category:", dbUpdates);

    const { data, error } = await supabase
      .from("seat_categories")
      .upsert(dbUpdates, {
        onConflict: 'id'
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error updating seat category:", error);
      toast.error("Error updating seat category: " + error.message);
      return null;
    }

    toast.success("Seat category updated successfully");
    return data as SeatCategory;
  } catch (error: any) {
    console.error("Failed to update seat category:", error.message || error);
    toast.error("Failed to update seat category");
    return null;
  }
}

export async function deleteSeatCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("seat_categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting seat category:", error);
      toast.error("Error deleting seat category");
      return false;
    }

    toast.success("Seat category deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Failed to delete seat category:", error.message || error);
    toast.error("Failed to delete seat category");
    return false;
  }
}

// New function to fetch seat categories for a specific match
export async function fetchSeatCategoriesForMatch(matchId: string): Promise<SeatCategory[]> {
  try {
    console.log("Fetching seat categories for match ID:", matchId);
    
    const { data, error } = await supabase
      .from("seat_categories")
      .select(`
        *,
        section:stadium_section_id(
          *,
          category:category_id(*)
        )
      `)
      .eq("match_id", matchId);

    if (error) {
      console.error("Error fetching seat categories for match:", error);
      toast.error("Error loading seat categories for match");
      return [];
    }

    console.log("Raw seat categories data for match:", data);
    
    const processedData = data.map((seatCategory) => {
      const safeSeatCategory = seatCategory as Record<string, any>;
      const safeSection = safeSeatCategory.section ? safeSeatCategory.section as Record<string, any> : {};
      const safeCategory = safeSection.category ? safeSection.category as Record<string, any> : {};
      
      return {
        ...safeSeatCategory,
        section_id: safeSeatCategory.stadium_section_id || "",
        section_name: safeSection.name || "Unknown Section",
        category_name: safeCategory.name || "Standard",
        color_code: safeSeatCategory.color_code || safeCategory.color_code || "#3b82f6",
        section: {
          id: safeSection.id || "",
          stadium_id: safeSection.stadium_id || "",
          section_name: safeSection.name || "Unknown Section",
          name: safeSection.name || "Unknown Section",
          category: {
            name: safeCategory.name || "Standard",
            color_code: safeCategory.color_code || "#3b82f6",
            id: safeCategory.id || ""
          }
        }
      } as SeatCategory;
    });

    console.log("Processed seat categories for match:", processedData);
    return processedData;
  } catch (error: any) {
    console.error("Failed to fetch seat categories for match:", error.message || error);
    toast.error("Failed to load seat categories for match");
    return [];
  }
}
