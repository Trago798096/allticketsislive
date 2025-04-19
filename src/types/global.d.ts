
declare namespace Components {
  type Booking = {
    id: string;
    name: string;
    email: string;
    phone: string;
    tickets: number;
    total_amount: number;
    payment_method?: string;
    status?: string;
    utr?: string;
    upi_id?: string;
    created_at?: string;
    payment_id?: string;
    match_id?: string;
    section_id?: string;
    seat_numbers?: number[] | string[];
    // Updated relations with more flexible typing
    match?: {
      id: string;
      team1?: string;
      team2?: string;
      date?: string;
      venue?: string;
      team1_details?: {
        id?: string;
        name?: string;
        short_name?: string;
        logo?: string;
        logo_url?: string;
      } | any; // Allow any type to accommodate error states
      team2_details?: {
        id?: string;
        name?: string;
        short_name?: string;
        logo?: string;
        logo_url?: string;
      } | any; // Allow any type to accommodate error states
      stadium?: {
        name?: string;
        location?: string;
      };
    };
    section?: {
      section_name?: string;
      category?: {
        name?: string;
        color_code?: string;
      };
    };
  };

  type UpiPaymentProps = {
    upiId: string;
    amount: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    onSuccess?: (details: { utr: string }) => void;
    onError?: (error: string) => void;
    onUtrSubmit: (utrId: string, upiId: string) => void;
    isProcessing: boolean;
    utrNumber?: string;
    onUpiIdChange?: (upiId: string) => void;
    onUtrNumberChange?: (utrNumber: string) => void;
  };

  interface SeatCategorySelectorProps {
    matchId: string;
    onCategoryChange: (categoryData: {
      sectionId: string;
      price: number;
      quantity: number;
      totalPrice: number;
      sectionName: string;
    }) => void;
    sections?: Array<{
      id: string;
      name: string;
      category?: string;
      color?: string;
      price: number;
      available: number;
    }>;
    onSectionChange?: (sectionId: string) => void;
    onSeatsChange?: (count: number) => void;
    selectedSection?: string;
    selectedSeats?: number;
  }
}

// Declare global window interface for confetti
interface Window {
  confetti: (options?: any) => void;
}
