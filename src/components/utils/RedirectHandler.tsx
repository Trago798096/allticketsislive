
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Component to handle redirects from stored session paths
 */
const RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a stored redirect path when the app loads
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");
    
    // Only redirect if we're on the home page and there's a stored path
    if (redirectPath && location.pathname === "/") {
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);
    }
  }, [navigate, location.pathname]);

  return null; // This component doesn't render anything
};

export default RedirectHandler;
