
// Get booking data from session storage
export const getBookingData = (): any => {
  try {
    const bookingData = sessionStorage.getItem('bookingData');
    if (bookingData) {
      return JSON.parse(bookingData);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse booking data:', error);
    return null;
  }
};

// Redirect if no booking data found
export const redirectIfNoBookingData = (navigate: any): boolean => {
  const bookingData = getBookingData();
  if (!bookingData) {
    // Check if we're on a parameterized URL that might handle its own loading
    const pathname = window.location.pathname;
    if (pathname.match(/\/payment\/[a-zA-Z0-9-]+$/)) {
      // This is a payment page with an ID, let the page component handle it
      return false;
    }
    
    navigate('/matches');
    return true;
  }
  return false;
};

// Save booking data to session storage
export const saveBookingData = (data: any): void => {
  try {
    sessionStorage.setItem('bookingData', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save booking data:', error);
  }
};

// Clear booking data from session storage
export const clearBookingData = (): void => {
  sessionStorage.removeItem('bookingData');
};
