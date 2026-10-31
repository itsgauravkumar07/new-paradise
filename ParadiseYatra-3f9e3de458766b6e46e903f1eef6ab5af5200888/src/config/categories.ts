// Frontend configuration for package categories
// This ensures consistency with the backend and prevents logical errors

export const PACKAGE_CATEGORIES = [
  'Beach Holidays',
  'Adventure Tours',
  'Trending Destinations',
  'Premium Packages',
  'Popular Packages',
  'Fixed Departure',
  'Mountain Treks',
  'Wildlife Safaris',
  'Pilgrimage Tours',
  'Honeymoon Packages',
  'Family Tours',
  'Luxury Tours',
  'Budget Tours'
] as const;

export const TOUR_TYPES = [
  { value: 'india', label: 'India' },
  { value: 'international', label: 'International' }
] as const;

export type PackageCategory = typeof PACKAGE_CATEGORIES[number];
export type TourType = typeof TOUR_TYPES[number]['value'];
