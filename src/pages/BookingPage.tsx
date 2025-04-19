
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMatchById, fetchSeatCategories } from "@/services/matchService";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/booking/LoadingState";
import { ErrorState } from "@/components/booking/ErrorState";
import BookingForm from "@/components/booking/BookingForm";
import { Card } from "@/components/ui/card";

const BookingPage = () => {
  // Use params to get matchId, but ensure we handle undefined case
  const { id: paramId } = useParams<{ id?: string }>();
  const matchId = paramId || '';
  
  console.log("BookingPage - Current matchId:", matchId);
  
  // Fetch match details with proper error handling
  const { 
    data: match, 
    isLoading: isLoadingMatch, 
    error: matchError 
  } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      console.log("Fetching match data for:", matchId);
      if (!matchId) {
        throw new Error("Match ID is missing");
      }
      const matchData = await fetchMatchById(matchId);
      console.log("Fetch result:", matchData);
      if (!matchData) {
        throw new Error(`Match with ID ${matchId} not found`);
      }
      return matchData;
    },
    enabled: !!matchId && matchId !== "undefined",
    retry: 2,
    retryDelay: 1000,
    meta: {
      errorMessage: "Failed to load match details"
    }
  });
  
  // Show loading state while data is being fetched
  if (isLoadingMatch) {
    return <LoadingState message="Loading match details..." />;
  }

  // Show error if match could not be loaded
  if (matchError) {
    console.error("Match error details:", matchError);
    return (
      <ErrorState 
        title="Error Loading Match"
        message="We encountered an error while loading the match details. Please try again."
        redirectPath="/matches"
        redirectLabel="Browse All Matches"
      />
    );
  }

  // Show error if match not found
  if (!match) {
    console.log("No match found with ID:", matchId);
    return (
      <ErrorState 
        title="Match Not Found"
        message="The match you're looking for doesn't exist or has been removed."
        redirectPath="/matches"
        redirectLabel="Browse All Matches"
      />
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ipl-blue to-ipl-purple bg-clip-text text-transparent mb-6">
            Book Tickets
          </h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              {/* Use the standalone BookingForm component */}
              <BookingForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
