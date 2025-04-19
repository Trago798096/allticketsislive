
import { supabase } from "@/integrations/supabase/client";
import { Payment, Booking } from "@/types/database";
import { toast } from "sonner";

// Create payment record
export async function createPayment(payment: Omit<Payment, "id">): Promise<Payment | null> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert([payment])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating payment:", error);
      toast.error("भुगतान रिकॉर्ड बनाने में त्रुटि हुई");
      return null;
    }

    return data as Payment;
  } catch (error: any) {
    console.error("Failed to create payment:", error.message || error);
    return null;
  }
}

// Validate UTR number
export async function validateUTR(utr: string): Promise<boolean> {
  console.log("Validating UTR:", utr);
  
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("amount")
      .eq("utr_number", utr);
      
    if (error) {
      console.error("Error validating UTR:", error);
      toast.error("UTR सत्यापन में त्रुटि हुई");
      return false;
    }
    
    const isValid = data && data.length > 0;
    console.log("UTR validation result:", isValid ? "Valid" : "Invalid");
    return isValid;
  } catch (error: any) {
    console.error("Failed to validate UTR:", error.message || error);
    toast.error("UTR सत्यापन विफल");
    return false;
  }
}

// Create booking with JSONB seats as requested
export async function createJSONBooking(booking: {
  seats: any;
  user_email: string;
  utr: string;
  match_id?: string;
}): Promise<Booking | null> {
  try {
    // First validate the UTR
    const isValidUTR = await validateUTR(booking.utr);
    
    if (!isValidUTR) {
      toast.error("अमान्य UTR नंबर");
      return null;
    }
    
    const { data, error } = await supabase
      .from("bookings")
      .insert([{
        seats: booking.seats,
        user_email: booking.user_email,
        utr: booking.utr,
        match_id: booking.match_id
      }])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      toast.error("बुकिंग बनाने में त्रुटि हुई");
      return null;
    }

    toast.success("बुकिंग सफलतापूर्वक बनाई गई");
    return data as unknown as Booking;
  } catch (error: any) {
    console.error("Failed to create booking:", error.message || error);
    toast.error("बुकिंग बनाने में विफल");
    return null;
  }
}

// Get booking by UTR
export async function getBookingByUTR(utr: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("utr", utr)
      .maybeSingle();

    if (error) {
      console.error("Error fetching booking by UTR:", error);
      return null;
    }

    return data as unknown as Booking;
  } catch (error: any) {
    console.error("Failed to fetch booking by UTR:", error.message || error);
    return null;
  }
}
