
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4 text-red-600" aria-label="404 Error">404</h1>
        <p className="text-xl text-gray-700 mb-6" id="not-found-message">Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-ipl-blue hover:bg-ipl-blue/90 text-white flex items-center justify-center w-full sm:w-auto" aria-label="Return to home page">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
