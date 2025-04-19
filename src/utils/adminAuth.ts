
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Check if current user is admin
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return false;
    }
    
    // Check if the email matches the admin email
    // Note: In production, use proper role-based authorization
    if (session.user.email === "ritikpaswal79984@gmail.com") {
      return true;
    }
    
    // Also check admin_users table
    const { data: adminData, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
    
    return !!adminData;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Verify admin session and redirect if not admin
export async function verifyAdminSession(): Promise<boolean> {
  const adminStatus = await isAdmin();
  
  if (!adminStatus) {
    toast.error("You don't have admin privileges");
    // If using client-side routing, redirect to home
    window.location.href = "/";
    return false;
  }
  
  return true;
}

// Admin login with email and password
export async function adminLogin(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Admin login error:", error);
      toast.error("Login failed");
      return false;
    }
    
    if (!data.session) {
      toast.error("Session not received");
      return false;
    }
    
    // Verify if the logged in user is admin
    const adminStatus = await isAdmin();
    
    if (!adminStatus) {
      toast.error("You don't have admin privileges");
      await supabase.auth.signOut();
      return false;
    }
    
    toast.success("Admin login successful");
    return true;
  } catch (error) {
    console.error("Admin login error:", error);
    toast.error("Login failed");
    return false;
  }
}

// Mobile detection for responsive UI adjustments
export function isMobileDevice(): boolean {
  return window.innerWidth <= 640;
}
