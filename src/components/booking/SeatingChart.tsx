
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Section {
  id: string;
  name: string;
  category?: string;
  color?: string;
  price: number;
  available: number;
}

interface SeatingChartProps {
  matchId: string;
  sections: Section[];
  onCategoryChange: (categoryData: {
    sectionId: string;
    price: number;
    quantity: number;
    totalPrice: number;
    sectionName: string;
  }) => void;
  selectedSection: string | null;
  selectedSeats: number;
  onSectionChange: (sectionId: string) => void;
  onSeatsChange: (seats: number) => void;
}

export const SeatingChart: React.FC<SeatingChartProps> = ({
  matchId,
  sections,
  onCategoryChange,
  selectedSection,
  selectedSeats,
  onSectionChange,
  onSeatsChange,
}) => {
  useEffect(() => {
    // Set default section if none is selected and sections are available
    if (!selectedSection && sections && sections.length > 0) {
      handleSectionChange(sections[0].id);
    }
  }, [sections, selectedSection]);

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId);
    calculateTotal(sectionId, selectedSeats);
  };

  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Math.max(1, parseInt(e.target.value) || 1);
    onSeatsChange(quantity);
    calculateTotal(selectedSection!, quantity);
  };

  const calculateTotal = (sectionId: string, quantity: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      onCategoryChange({
        sectionId,
        price: section.price,
        quantity,
        totalPrice: section.price * quantity,
        sectionName: section.name,
      });
    }
  };

  const getCurrentSectionPrice = () => {
    if (!selectedSection) return 0;
    const section = sections.find((s) => s.id === selectedSection);
    return section ? section.price : 0;
  };

  if (!sections || sections.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Seating Categories Available</AlertTitle>
        <AlertDescription>
          There are no seat categories configured for this match. Please contact the administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div>
        <h2 className="text-lg font-medium mb-3">Select Seating Category</h2>
        <RadioGroup
          value={selectedSection || undefined}
          onValueChange={handleSectionChange}
          className="grid gap-3"
          name="seating-category"
          id="seating-category"
        >
          {sections.map((section) => (
            <Label
              key={section.id}
              className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedSection === section.id
                  ? "border-ipl-blue bg-blue-50"
                  : "border-gray-200"
              }`}
              htmlFor={`section-${section.id}`}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value={section.id}
                  id={`section-${section.id}`}
                />
                <div>
                  <div className="font-medium">{section.name}</div>
                  <div className="text-sm text-gray-500">
                    {section.category || "Standard Seating"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">₹{section.price}</div>
                <div className="text-xs text-gray-500">
                  {section.available > 0
                    ? `${section.available} available`
                    : "Limited availability"}
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div className="grid gap-3">
        <h2 className="text-lg font-medium">Number of Tickets</h2>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min="1"
            value={selectedSeats}
            onChange={handleSeatsChange}
            className="w-24"
            id="ticket-quantity"
            name="ticket-quantity"
            aria-label="Ticket quantity"
            autoComplete="off"
          />
          <span className="text-gray-500">× ₹{getCurrentSectionPrice()}</span>
        </div>
      </div>
    </div>
  );
};
