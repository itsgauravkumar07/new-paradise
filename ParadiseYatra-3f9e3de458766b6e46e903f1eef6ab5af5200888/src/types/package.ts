export interface Package {
  _id: string;
  title: string;
  slug: string;
  coverImage?: string; // Add this line to match your API log
  description: string;
  shortDescription: string;
  price: number;
  priceType?: "per_person" | "per_couple";
  originalPrice?: number;
  discount?: number;
  duration: string;
  destination: string;
  category: string;
  holidayType?: {
    _id: string;
    title: string;
    slug: string;
    image: string;
  };
  country: string;
  state?: string;
  tourType: 'international' | 'india';
  images: string[];
  destinationsCovered?: string[];
  highlights?: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  terms: string[];
  rating?: number;
  reviews?: Review[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  accommodation: string;
  meals: string;
  image?: string;
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface PackageResponse {
  data: Package[];
  message?: string;
  success?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface SinglePackageResponse {
  data: Package;
  message?: string;
  success?: boolean;
} 
