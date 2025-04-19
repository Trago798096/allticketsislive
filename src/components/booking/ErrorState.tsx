
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  title: string;
  message: string;
  redirectPath?: string;
  redirectLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  redirectPath = "/",
  redirectLabel = "Return to Home"
}) => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-md" id="error-container">
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
          
          <div className="text-center mt-4">
            <Button asChild variant="default">
              <Link to={redirectPath}>
                {redirectLabel}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
