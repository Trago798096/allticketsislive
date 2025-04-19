
import { Team } from "@/types/database";

interface TeamInfo {
  id?: string;
  name: string;
  shortName?: string;
  logo?: string;
  ticketPrice?: string;
}

/**
 * Extract consistent team information from various team objects
 */
export const getTeamInfo = (team: any): TeamInfo => {
  if (!team) {
    return { name: "Unknown Team" };
  }
  
  // Handle string case
  if (typeof team === 'string') {
    return { name: team };
  }
  
  // Handle object case
  if (typeof team === 'object') {
    return {
      id: team.id || "",
      name: team.team_name || team.name || "Unknown Team",
      shortName: team.short_name || team.shortName || "",
      logo: team.logo_url || team.logo || "",
      ticketPrice: team.ticketPrice || "999"
    };
  }
  
  return { name: "Unknown Team" };
};

/**
 * Get team logo URL with fallback
 * Fixed to ensure consistent loading across devices/browsers
 */
export const getTeamLogo = (team: any): string => {
  if (!team) {
    return "/assets/default-team.png";
  }
  
  if (typeof team === 'object') {
    // Use Supabase storage URL for team logos
    const logo = team.logo_url || team.logo;
    
    // If logo is a full URL, return it as is
    if (logo && (logo.startsWith('http') || logo.startsWith('/'))) {
      return logo;
    }
    
    // Otherwise construct URL to Supabase storage
    if (logo) {
      // Ensure no double slashes by trimming any leading slashes
      const cleanLogo = logo.startsWith('/') ? logo.substring(1) : logo;
      // Add cache buster to prevent caching issues
      const cacheBuster = new Date().getTime();
      return `https://mlmibkkiunueyidehdbt.supabase.co/storage/v1/object/public/team-logos/${cleanLogo}?v=${cacheBuster}`;
    }
    
    return "/assets/default-team.png";
  }
  
  return "/assets/default-team.png";
};

/**
 * Format team name for display
 */
export const formatTeamName = (team: any): string => {
  const info = getTeamInfo(team);
  return info.name;
};

/**
 * Handle errors when loading team logos
 */
export const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>, teamName: string): void => {
  console.warn(`Failed to load logo for team: ${teamName}`);
  const target = e.target as HTMLImageElement;
  target.src = "/assets/default-team.png";
};
