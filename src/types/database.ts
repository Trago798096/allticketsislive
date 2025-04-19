
// Database types for the application
// Since we cannot modify src/integrations/supabase/types.ts, we define additional types here

export interface Team {
  id: string;
  team_name: string;
  name?: string; // Add this field for compatibility
  short_name?: string;
  logo?: string;
  logo_url?: string;
  description?: string;
  established_year?: number;
  home_venue?: string;
  created_at?: string;
  updated_at?: string;
  // Add additional compatibility fields
  shortName?: string;
  ticketPrice?: string;
}

export interface Match {
  id: string;
  team1_id?: string;
  team2_id?: string;
  match_date: string;
  date?: string;
  venue?: string;
  stadium_id?: string;
  match_type?: string;
  status?: string;
  match_number?: number;
  match_id?: number; // This is auto-generated, but we need it in the type
  created_at?: string;
  team1_details?: Team | null; // Modified to handle null states
  team2_details?: Team | null; // Modified to handle null states
  stadium?: Stadium | null;
  // UI-specific properties
  isLive?: boolean;
  isUpcoming?: boolean;
  time?: string;
  availability?: string;
  // Properties for compatibility with existing code
  team1?: Team | {
    name: string;
    shortName: string;
    logo: string;
    ticketPrice: string;
    team_name?: string;
  } | null | any;
  team2?: Team | {
    name: string;
    shortName: string;
    logo: string;
    ticketPrice: string;
    team_name?: string;
  } | null | any;
  seatCategories?: SeatCategory[]; // Add this field for direct access to seat categories
}

export interface Stadium {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  address?: string;
  image_url?: string;
  stadium_id?: number;
  city?: string; // Added city field
}

export interface StadiumSection {
  id: string;
  stadium_id: string;
  section_name: string; // This maps to 'name' in the sections table
  name?: string; // Keep both name and section_name for compatibility
  seating_capacity?: number; // This field isn't in the database but used in the frontend
  category_id?: string; // This field isn't in the database but used in the frontend
  category?: SeatingCategory | null; // Make category nullable to prevent TS errors
  created_at?: string;
  updated_at?: string;
}

export interface SeatingCategory {
  id?: string;
  name: string;
  description?: string;
  color_code?: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
  match_id: string;         // Required field
  stadium_section_id?: string; // Make optional
  availability?: number;    // Add this field to fix TypeScript error
  section_id?: string;      // Add this field to fix TypeScript error
}

// Updated to match the actual structure returned by the API
export interface SeatCategory {
  id: string;
  name?: string;
  price: number;
  match_id: string;
  stadium_section_id: string; // Required field
  section_id?: string; // Alternative field for compatibility
  availability: number;
  created_at?: string | null;
  updated_at?: string | null;
  section?: {
    id?: string;
    stadium_id?: string;
    section_name?: string;
    name?: string;
    category?: {
      id?: string;
      name?: string;
      color_code?: string;
    } | null;
  } | Record<string, any> | null; // Modified to handle null states and any object
  // Additional fields from processing
  section_name?: string;
  category_name?: string;
  color_code?: string;
}

export interface MatchPrice {
  price_id: number;
  match_id: string;
  section_id: string;
  price: number;
  category?: string;
  section?: StadiumSection | null; // Modified to handle null states
}

export interface MatchDetails {
  id: string;
  team1: {
    name: string;
    shortName: string;
    logo: string;
    ticketPrice: string;
    team_name?: string;
  };
  team2: {
    name: string;
    shortName: string;
    logo: string;
    ticketPrice: string;
    team_name?: string;
  };
  date: string;
  time: string;
  venue: string;
  isLive: boolean;
  isUpcoming: boolean;
  availability: string;
  
  // Add missing fields to fix TypeScript errors
  match_date?: string;
  stadium?: Stadium | null;
  status?: string;
  seatCategories?: SeatCategory[];
}

export interface BookingForm {
  match_id: string;
  seat_category_id: string;
  section_id: string;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  upi_id: string;
  utr: string;
  user_email: string;
  total_amount: number;
}

export interface Booking {
  id: string;
  booking_id?: string;  // Changed from number to string for UUID
  match_id?: string;
  seat_category_id?: string;
  section_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  tickets?: number;
  upi_id?: string;
  utr?: string;
  utr_number?: string;
  user_email?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  payment_id?: string;
  payment_method?: string;
  seat_number?: string;
  seat_numbers?: string[];
  quantity?: number;
  user_name?: string;
  match?: Match | any; // Modified to handle error states
  seat_category?: SeatCategory | any; // Modified to handle error states
  section?: {
    section_name?: string;
    category?: {
      name?: string;
      color_code?: string;
    } | null;
  } | any; // Modified to handle error states and null category
  // Additional fields for JSON bookings
  seats?: any;
}

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Add interface for payment validation
export interface Payment {
  id: string;
  match_id: string;
  user_email: string;
  amount: number;
  utr_number: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
