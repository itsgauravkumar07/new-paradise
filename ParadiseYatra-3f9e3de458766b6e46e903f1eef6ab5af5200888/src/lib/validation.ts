// Validation utilities for API routes
import { PACKAGE_CATEGORIES, TOUR_TYPES } from '@/config/categories';

export const VALID_TOUR_TYPES = TOUR_TYPES.map(t => t.value);
export const VALID_CATEGORIES = PACKAGE_CATEGORIES;

export function validateTourType(tourType: string | null): boolean {
  if (!tourType) return true; // Optional parameter
  return VALID_TOUR_TYPES.includes(tourType as any);
}

export function validateCategory(category: string | null): boolean {
  if (!category) return true; // Optional parameter
  return VALID_CATEGORIES.includes(category as any);
}

export function validateLimit(limit: string | null): boolean {
  if (!limit) return true; // Optional parameter
  const numLimit = parseInt(limit, 10);
  return !isNaN(numLimit) && numLimit > 0 && numLimit <= 100;
}

export function validateApiParams(params: {
  tourType?: string | null;
  state?: string | null;
  category?: string | null;
  limit?: string | null;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (params.tourType && !validateTourType(params.tourType)) {
    errors.push(`Invalid tourType: ${params.tourType}. Must be one of: ${VALID_TOUR_TYPES.join(', ')}`);
  }

  // State parameter can be any string (country/state name), no validation needed

  if (params.category && !validateCategory(params.category)) {
    errors.push(`Invalid category: ${params.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (params.limit && !validateLimit(params.limit)) {
    errors.push(`Invalid limit: ${params.limit}. Must be a number between 1 and 100`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
