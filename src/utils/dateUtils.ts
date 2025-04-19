
/**
 * Format a date string into a readable format
 */
export const formatDate = (dateString: string, includeTime: boolean = true): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(includeTime && { hour: "2-digit", minute: "2-digit" })
    };
    
    return date.toLocaleString("en-IN", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Format a date string for display in the UI
 */
export const formatMatchDate = (dateString: string): { date: string; time: string } => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return { date: "TBD", time: "TBD" };
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit"
    };
    
    const formattedDate = date.toLocaleString("en-IN", dateOptions);
    const formattedTime = date.toLocaleString("en-IN", timeOptions);
    
    return {
      date: formattedDate,
      time: formattedTime
    };
  } catch (error) {
    console.error("Error formatting match date:", error);
    return { date: "TBD", time: "TBD" };
  }
};
