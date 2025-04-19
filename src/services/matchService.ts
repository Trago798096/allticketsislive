
import { supabase } from "@/integrations/supabase/client";
import { Match, SeatCategory } from "@/types/database";
import { toast } from "sonner";

// Fetch all matches
export async function fetchMatches(): Promise<Match[]> {
  try {
    // Use direct team relationships without foreign key notation
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        team1:team1_id(id, name, team_name, short_name, logo, logo_url),
        team2:team2_id(id, name, team_name, short_name, logo, logo_url),
        stadium:stadium_id(*)
      `)
      .order("match_date");

    if (error) {
      console.error("Error fetching matches:", error);
      toast.error("मैच लोड करने में त्रुटि हुई");
      throw error;
    }

    console.log("Successfully loaded matches:", data?.length || 0);
    
    const processedData = data.map(match => {
      return {
        ...match,
        team1_details: match.team1 || null,
        team2_details: match.team2 || null,
        team1: match.team1 || { name: "Unknown Team", shortName: "UNK", logo: "", ticketPrice: "0" },
        team2: match.team2 || { name: "Unknown Team", shortName: "UNK", logo: "", ticketPrice: "0" }
      };
    });
    
    return processedData as unknown as Match[];
  } catch (error: any) {
    console.error("Failed to fetch matches:", error.message || error);
    throw error;
  }
}

// Fetch upcoming matches
export async function fetchUpcomingMatches(): Promise<Match[]> {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        team1:team1_id(id, name, team_name, short_name, logo, logo_url),
        team2:team2_id(id, name, team_name, short_name, logo, logo_url),
        stadium:stadium_id(*)
      `)
      .eq("status", "upcoming")
      .order("match_date");

    if (error) {
      console.error("Error fetching upcoming matches:", error);
      toast.error("आने वाले मैचों को लोड करने में त्रुटि हुई");
      throw error;
    }

    const processedData = data.map(match => {
      return {
        ...match,
        team1_details: match.team1 || null,
        team2_details: match.team2 || null,
        team1: match.team1 || { name: "Unknown Team", shortName: "UNK", logo: "", ticketPrice: "0" },
        team2: match.team2 || { name: "Unknown Team", shortName: "UNK", logo: "", ticketPrice: "0" }
      };
    });
    
    return processedData as unknown as Match[];
  } catch (error: any) {
    console.error("Failed to fetch upcoming matches:", error.message || error);
    throw error;
  }
}

// Fetch a single match by ID with improved error handling
export async function fetchMatch(id: string): Promise<Match> {
  console.log("Fetching match with ID:", id);
  
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        team1:team1_id(id, name, team_name, short_name, logo, logo_url),
        team2:team2_id(id, name, team_name, short_name, logo, logo_url),
        stadium:stadium_id(*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching match:", error);
      toast.error("मैच विवरण प्राप्त करने में त्रुटि हुई");
      throw error;
    }

    if (!data) {
      const notFoundError = new Error(`Match with ID ${id} not found`);
      console.error(notFoundError);
      toast.error("मैच नहीं मिला");
      throw notFoundError;
    }

    const processedData = {
      ...data,
      team1_details: data.team1 || null,
      team2_details: data.team2 || null,
      team1: data.team1 || { name: "Unknown Team", shortName: "UNK", logo: "", ticketPrice: "0" },
      team2: data.team2 || { name: "Unknown Team", shortName: "UNK", logo: "", ticketPrice: "0" }
    };

    console.log("Match data returned:", processedData);
    return processedData as unknown as Match;
  } catch (error: any) {
    console.error("Failed to fetch match:", error.message || error);
    throw error;
  }
}

// Fetch match by ID (alternative name)
export async function fetchMatchById(id: string): Promise<Match> {
  return fetchMatch(id);
}

// Fetch match with detailed section and seat category information
export async function fetchMatchWithSeating(id: string): Promise<Match> {
  console.log("Fetching match with seating details for ID:", id);
  
  try {
    const matchData = await fetchMatch(id);
    
    const seatCategories = await fetchSeatCategoriesForMatch(id);
    
    const matchWithSeating = {
      ...matchData,
      seatCategories: seatCategories
    };
    
    return matchWithSeating as Match;
  } catch (error) {
    console.error("Failed to fetch match with seating details:", error);
    throw error;
  }
}

// Fetch seat categories for a match - Fixed headers and type safety issues
export async function fetchSeatCategoriesForMatch(matchId: string) {
  console.log("Fetching seat categories for match:", matchId);
  
  try {
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
      console.error("Error fetching seat categories:", error);
      toast.error("सीट श्रेणियां प्राप्त करने में त्रुटि हुई");
      throw error;
    }
    
    console.log("Received seat categories data:", data);
    
    const processedData = data?.map(category => {
      if (!category) return null;
      
      const section = category.section || {};
      
      const safeSection = section as Record<string, any>;
      const safeCategory = safeSection.category as Record<string, any> || {};
      
      return {
        id: category.id || "",
        name: category.name || "General",
        price: category.price || 0,
        availability: category.availability || 0,
        match_id: category.match_id || "",
        stadium_section_id: category.stadium_section_id || "", 
        section_id: category.stadium_section_id || "",
        section_name: safeSection.name || "Unknown Section",
        category_name: safeCategory.name || "Standard",
        color_code: safeCategory.color_code || "#3b82f6",
        section: {
          id: safeSection.id || "",
          stadium_id: safeSection.stadium_id || "",
          section_name: safeSection.name || "Unknown Section",
          name: safeSection.name || "Unknown Section",
          category: safeCategory ? {
            id: safeCategory.id || "",
            name: safeCategory.name || "Standard", 
            color_code: safeCategory.color_code || "#3b82f6"
          } : { 
            id: "",
            name: "Standard", 
            color_code: "#3b82f6" 
          }
        }
      };
    }).filter(Boolean) || [];
    
    console.log("Processed seat categories:", processedData);
    return processedData as SeatCategory[];
  } catch (error: any) {
    console.error("Failed to fetch seat categories:", error.message || error);
    toast.error("सीट श्रेणियां प्राप्त करने में विफल");
    throw error;
  }
}

// Alias function for better naming
export const fetchSeatCategories = fetchSeatCategoriesForMatch;

// Calculate total price
export function calculateTotalPrice(price: number, quantity: number): number {
  return price * quantity;
}
