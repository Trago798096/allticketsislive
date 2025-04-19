
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate as useReactRouterNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/database';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useReactRouterNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
            checkIsAdmin(newSession.user);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    const initializeSession = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", existingSession);
        
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          await fetchUserProfile(existingSession.user.id);
          await checkIsAdmin(existingSession.user);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createAdminUserIfNeeded = async (userData: User) => {
    if (!userData || !userData.email) return;
    
    if (userData.email === "ritikpaswal79984@gmail.com") {
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .upsert({
            id: userData.id,
            email: userData.email,
            role: "admin"
          })
          .select("*")
          .single();
        
        if (error) {
          console.error("Error creating admin user in admin_users table:", error);
          console.error("Cannot create admin in legacy table as it doesn't exist in schema");
        } else {
          console.log("Admin user created or updated:", data);
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Failed to create admin user:", err);
      }
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      setProfile(data || null);
      return data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  };

  const checkIsAdmin = async (userData: User) => {
    if (!userData) {
      setIsAdmin(false);
      return false;
    }
  
    try {
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", userData.id);
        
      if (adminError) {
        console.error("Error checking admin status:", adminError);
        setIsAdmin(false);
        return false;
      }
      
      const isAdminFromNew = adminData && adminData.length > 0;
      setIsAdmin(isAdminFromNew);
      
      if (userData.email === "ritikpaswal79984@gmail.com" && !isAdminFromNew) {
        await createAdminUserIfNeeded(userData);
        setIsAdmin(true);
        return true;
      }
      
      return isAdminFromNew;
    } catch (error) {
      console.error("Failed to check admin status:", error);
      setIsAdmin(false);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();
          
        if (!adminData && email === "ritikpaswal79984@gmail.com") {
          await supabase
            .from("admin_users")
            .upsert({
              id: data.user.id,
              role: "admin",
              email: email
            });
        }
      }
      
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectPath;
      }
      
      toast.success("साइन इन सफलतापूर्वक पूरा हुआ!");
    } catch (error: any) {
      toast.error(error.message || "साइन इन करने में विफल");
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      toast.success("खाता सफलतापूर्वक बनाया गया! कृपया सत्यापन के लिए अपना ईमेल जांचें।");
    } catch (error: any) {
      toast.error(error.message || "खाता बनाने में विफल");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      toast.success("Successfully signed out");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      toast.error("प्रोफ़ाइल अपडेट करने के लिए आपको लॉग इन होना चाहिए");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success("प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!");
    } catch (error: any) {
      toast.error(error.message || "प्रोफ़ाइल अपडेट करने में विफल");
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    profile,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
