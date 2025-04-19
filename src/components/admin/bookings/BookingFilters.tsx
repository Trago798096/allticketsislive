
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BookingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
}

export const BookingFilters = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter = '', 
  onStatusFilterChange 
}: BookingFiltersProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 w-full md:w-[200px]"
          id="booking-search"
          name="booking-search"
        />
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 p-0 text-gray-500"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {onStatusFilterChange && (
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={statusFilter ? "secondary" : "outline"} 
              size="sm" 
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              {statusFilter ? `Status: ${statusFilter}` : "Filter"}
              {statusFilter && (
                <X 
                  className="h-3 w-3 ml-1" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusFilterChange('');
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Status</h4>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  onStatusFilterChange(value);
                  setIsFilterOpen(false);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
