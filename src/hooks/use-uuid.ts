
/**
 * UUID validation utilities
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Checks if a string is a valid UUID (v4)
 * @param uuid The string to check
 * @returns boolean indicating if the string is a valid UUID
 */
export function isValidUUID(uuid: string | null | undefined): boolean {
  if (!uuid) return false;
  
  // Regular expression for UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Hook to validate a UUID and provide handling for invalid UUIDs
 * @param uuid The UUID to validate
 * @param fallback A fallback UUID to use if the provided one is invalid
 * @returns The validated UUID or the fallback
 */
export function useValidUUID(uuid: string | null | undefined, fallback?: string): string {
  if (isValidUUID(uuid)) {
    return uuid as string;
  }
  
  if (fallback && isValidUUID(fallback)) {
    return fallback;
  }
  
  // Return empty string if no valid UUID is found
  return "";
}

/**
 * Helper to generate a random UUID for testing
 * Returns a hardcoded value for dev environments and real UUIDs for production
 */
export function getTestUUID(): string {
  return uuidv4();
}
