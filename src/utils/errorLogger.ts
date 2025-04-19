
/**
 * Enhanced error logging utility for application-wide use
 */

// Log an error with context information
export function logError(error: any, context: string, additionalInfo?: Record<string, any>): void {
  console.error(`[ERROR] ${context}:`, error);
  
  if (additionalInfo) {
    console.error(`Additional context:`, additionalInfo);
  }
  
  // Log the error stack if available
  if (error?.stack) {
    console.error(`Stack trace:`, error.stack);
  }
}

// Log a detailed API error
export function logAPIError(error: any, endpoint: string, params?: Record<string, any>): void {
  const errorData = {
    message: error?.message || 'Unknown error',
    status: error?.status,
    statusText: error?.statusText,
    details: error?.details,
    endpoint,
    params,
    timestamp: new Date().toISOString()
  };
  
  console.error(`[API ERROR] ${endpoint}:`, errorData);
  
  if (error?.stack) {
    console.error(`Stack trace:`, error.stack);
  }
}

// Log a Supabase query error with details
export function logSupabaseError(error: any, query: string, params?: Record<string, any>): void {
  const errorData = {
    code: error?.code,
    message: error?.message || 'Unknown error',
    details: error?.details,
    hint: error?.hint,
    query,
    params,
    timestamp: new Date().toISOString()
  };
  
  console.error(`[SUPABASE ERROR] ${query}:`, errorData);
}

// Create a wrapper for better query debugging
export function withErrorLogging<T>(
  fn: (...args: any[]) => Promise<T>,
  context: string
): (...args: any[]) => Promise<T> {
  return async (...args: any[]) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      logError(error, context, { args });
      throw error;
    }
  };
}
