
import { supabase } from "@/integrations/supabase/client";

// Export all admin-related services from their respective files
export * from './teamService';
// Avoid exporting duplicates by explicitly re-exporting from stadiumService
export {
  createStadium,
  fetchStadiums,
  updateStadium, 
  deleteStadium,
  createStadiumSection,
  fetchStadiumSections,
  updateStadiumSection,
  deleteStadiumSection
} from './stadiumService';
// Avoid exporting duplicates by explicitly re-exporting from seatService
export {
  createSeatingCategory,
  updateSeatingCategory,
  deleteSeatingCategory,
  createSeatCategory,
  updateSeatCategory,
  deleteSeatCategory
} from './seatService';
export * from './matchService';

// Add any remaining admin-specific utilities here
export async function validateUTR(utr: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('utr_number', utr);
      
    if (error) {
      console.error("Error validating UTR:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Failed to validate UTR:", error);
    return false;
  }
}
