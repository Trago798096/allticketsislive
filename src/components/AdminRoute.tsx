
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function validateAdminAccess() {
      // Skip additional check if already determined from context
      if (isAdmin) {
        setHasAccess(true);
        setIsValidating(false);
        return;
      }

      // Double-check admin status directly from Supabase as a security measure
      if (user?.id) {
        try {
          // First try to use the admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from("admin_users")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (adminError) {
            console.error("Error validating admin access from admin_users:", adminError);
            setHasAccess(false);
          } else if (adminData) {
            setHasAccess(true);
          } else {
            // Special case for our known admin
            if (user.email === "ritikpaswal79984@gmail.com") {
              try {
                // Add user to admin_users if they're not there
                await supabase
                  .from("admin_users")
                  .upsert({
                    id: user.id,
                    email: user.email,
                    role: "admin"
                  });
                setHasAccess(true);
              } catch (err) {
                console.error("Error adding default admin:", err);
                setHasAccess(false);
              }
            } else {
              toast.error("Access to this page is not permitted", {
                description: "You don't have admin privileges"
              });
              setHasAccess(false);
            }
          }
        } catch (err) {
          console.error("Error in admin validation:", err);
          toast.error("Problem accessing admin panel");
          setHasAccess(false);
        }
      } else {
        setHasAccess(false);
      }
      
      setIsValidating(false);
    }

    if (!isLoading) {
      validateAdminAccess();
    }
  }, [user, isAdmin, isLoading]);

  if (isLoading || isValidating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" />
      </div>
    );
  }

  if (!user) {
    toast.error("Login required");
    // Store the intended destination to redirect after login
    sessionStorage.setItem("redirectAfterLogin", "/admin");
    return <Navigate to="/auth" replace />;
  }

  if (!hasAccess && !isAdmin) {
    toast.error("Access to admin panel denied");
    return <Navigate to="/" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default AdminRoute;
