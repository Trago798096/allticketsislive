
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSeatCategories } from "@/services/matchService";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Ticket, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { isValidUUID } from "@/hooks/use-uuid";

interface Section {
  id: string;
  name: string;
  category?: string;
  color?: string;
  price: number;
  available: number;
}

interface SeatCategorySelectorProps {
  matchId: string;
  sections?: Section[];
  selectedSection: string;
  selectedSeats: number;
  onSectionChange: (sectionId: string) => void;
  onSeatsChange: (seats: number) => void;
  onCategoryChange: (categoryData: {
    sectionId: string;
    price: number;
    quantity: number;
    totalPrice: number;
    sectionName: string;
  }) => void;
  "aria-labelledby"?: string;
}

export const SeatCategorySelector: React.FC<SeatCategorySelectorProps> = ({
  matchId,
  sections: propSections,
  selectedSection,
  selectedSeats,
  onSectionChange,
  onSeatsChange,
  onCategoryChange,
  "aria-labelledby": ariaLabelledBy,
}) => {
  // Validate matchId
  const validMatchId = isValidUUID(matchId) ? matchId : "";
  
  // Use sections from props if provided, otherwise fetch from API
  const { data: fetchedSections, isLoading, isError } = useQuery({
    queryKey: ["seat-categories", validMatchId],
    queryFn: async () => {
      if (!validMatchId) {
        console.warn("Invalid matchId provided to SeatCategorySelector");
        return [];
      }
      
      try {
        console.log("Fetching seat categories in SeatCategorySelector for match:", validMatchId);
        const categories = await fetchSeatCategories(validMatchId);
        console.log("SeatCategorySelector - fetchedSections:", categories);
        return categories || [];
      } catch (error) {
        console.error("Error fetching seat categories in SeatCategorySelector:", error);
        return [];
      }
    },
    enabled: !!validMatchId && !propSections,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error("Error in seat categories query:", error);
        toast.error("Could not load seating options");
      }
    }
  });

  // Deduplicate sections using a Map with section id as key
  const [uniqueSections, setUniqueSections] = useState<Section[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  useEffect(() => {
    // Reset error message
    setErrorMessage("");
    
    // Use either prop sections or fetched sections
    const sectionsToProcess = propSections || fetchedSections || [];
    console.log("SeatCategorySelector - processing sections:", sectionsToProcess);
    
    if (!sectionsToProcess || sectionsToProcess.length === 0) {
      console.log("No sections to process");
      setUniqueSections([]);
      
      if (isError || (fetchedSections && fetchedSections.length === 0)) {
        setErrorMessage("No seating categories are available for this match.");
      }
      
      return;
    }
    
    // Use a map to eliminate duplicates by ID
    const sectionsMap = new Map<string, Section>();
    
    sectionsToProcess.forEach((section: any) => {
      if (!section) return;
      
      // Use either the section's id or stadium_section_id as the key
      const sectionId = section.id || section.stadium_section_id;
      
      // Skip invalid sections
      if (!sectionId || sectionId === "invalid" || sectionId === "undefined") return;
      
      if (!sectionsMap.has(sectionId)) {
        sectionsMap.set(sectionId, {
          id: sectionId,
          name: section.name || section.section_name || 'General',
          category: section.category || 'Standard',
          color: section.color || (section.category?.color_code) || '#3b82f6',
          price: Number(section.price) || 999,
          available: section.available || section.availability || 100
        });
      }
    });
    
    // Convert map back to array
    const uniqueSectionArray = Array.from(sectionsMap.values());
    console.log("SeatCategorySelector - uniqueSections:", uniqueSectionArray);
    setUniqueSections(uniqueSectionArray);
    
    // If we have sections and none are selected yet, select the first one
    if (uniqueSectionArray.length > 0 && !selectedSection) {
      const firstSection = uniqueSectionArray[0];
      onSectionChange(firstSection.id);
      onCategoryChange({
        sectionId: firstSection.id,
        price: firstSection.price,
        quantity: selectedSeats,
        totalPrice: firstSection.price * selectedSeats,
        sectionName: firstSection.name
      });
    }
  }, [propSections, fetchedSections, selectedSection, selectedSeats, onSectionChange, onCategoryChange, isError]);

  // Handler for section change
  const handleSectionChange = (sectionId: string) => {
    const section = uniqueSections.find(s => s.id === sectionId);
    if (section) {
      onSectionChange(sectionId);
      
      // Update category data for parent component
      onCategoryChange({
        sectionId: sectionId,
        price: section.price,
        quantity: selectedSeats,
        totalPrice: section.price * selectedSeats,
        sectionName: section.name
      });
    }
  };

  // Handler for seats change
  const handleSeatsChange = (seats: number) => {
    const section = uniqueSections.find(s => s.id === selectedSection);
    if (section) {
      onSeatsChange(seats);
      
      // Update category data for parent component
      onCategoryChange({
        sectionId: selectedSection,
        price: section.price,
        quantity: seats,
        totalPrice: section.price * seats,
        sectionName: section.name
      });
    }
  };

  // Loading state
  if (isLoading && !propSections) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Error state or no sections available
  if (uniqueSections.length === 0 || errorMessage) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center text-amber-800" role="alert">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>{errorMessage || "No seating categories available for this match."}</p>
          </div>
          {isError && (
            <p className="text-sm text-amber-700 mt-2">
              There was an issue loading the seating options. Please try refreshing the page.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className="space-y-6" 
      aria-labelledby={ariaLabelledBy} 
      role="region"
      aria-live="polite"
    >
      <div>
        <h3 id="seating-category-heading" className="font-medium mb-3 flex items-center">
          <Ticket className="h-4 w-4 mr-2" />
          Select Seating Category
        </h3>
        
        <RadioGroup 
          value={selectedSection} 
          onValueChange={handleSectionChange}
          className="gap-3"
          aria-labelledby="seating-category-heading"
          name="seat-category"
        >
          {uniqueSections.map(section => (
            <div 
              key={section.id}
              className={`flex items-center space-x-2 border p-3 rounded-md ${
                selectedSection === section.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <RadioGroupItem 
                value={section.id} 
                id={`section-${section.id}`} 
                aria-labelledby={`section-label-${section.id}`}
                aria-describedby={`section-details-${section.id}`}
              />
              <Label 
                htmlFor={`section-${section.id}`}
                className="w-full flex flex-wrap justify-between"
                id={`section-label-${section.id}`}
              >
                <span className="font-medium">{section.name}</span>
                <span className="ml-auto" id={`section-details-${section.id}`}>
                  <span className="text-sm text-gray-500 mr-2">
                    {section.available} available
                  </span>
                  <span className="font-bold">₹{section.price}</span>
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div>
        <h3 id="ticket-quantity-heading" className="font-medium mb-3">Number of Tickets</h3>
        <Select 
          value={selectedSeats.toString()} 
          onValueChange={(value) => handleSeatsChange(parseInt(value))}
          aria-labelledby="ticket-quantity-heading"
        >
          <SelectTrigger id="ticket-quantity" name="ticket-quantity" className="w-full">
            <SelectValue placeholder="Select number of tickets" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
              const selectedSectionObj = uniqueSections.find(s => s.id === selectedSection);
              const isDisabled = selectedSectionObj ? selectedSectionObj.available < num : true;
              
              return (
                <SelectItem 
                  key={num} 
                  value={num.toString()}
                  disabled={isDisabled}
                >
                  {num} {num === 1 ? 'Ticket' : 'Tickets'} 
                  {isDisabled && ' (Not available)'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      {selectedSection && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Price per ticket:</span>
            <span className="font-medium">
              ₹{uniqueSections.find(s => s.id === selectedSection)?.price || 0}
            </span>
          </div>
          <div className="flex items-center justify-between font-medium mt-1">
            <span>Total ({selectedSeats} tickets):</span>
            <span className="text-lg">
              ₹{(uniqueSections.find(s => s.id === selectedSection)?.price || 0) * selectedSeats}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
