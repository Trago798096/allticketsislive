
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading..."
}) => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-ipl-blue mb-4" />
          <p className="text-gray-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};
