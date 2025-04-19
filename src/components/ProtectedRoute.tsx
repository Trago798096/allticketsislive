
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    // Remember the page the user was trying to access
    sessionStorage.setItem("redirectAfterLogin", location.pathname);
    
    toast.error("Please log in to access this page");
    return <Navigate to="/auth" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
