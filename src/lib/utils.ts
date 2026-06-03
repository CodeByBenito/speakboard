import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses a YYYY-MM-DD date string as a local Date object.
 * This prevents timezone offset issues where dates are shifted to the previous day.
 */
export function parseLocalDate(dateString: string | undefined | null): Date {
  if (!dateString) return new Date();
  
  // If it contains a time component or timezone offset, parse normally
  if (dateString.includes('T') || dateString.includes('Z')) {
    return new Date(dateString);
  }
  
  // Otherwise, split YYYY-MM-DD and parse as local date
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  return new Date(dateString);
}

