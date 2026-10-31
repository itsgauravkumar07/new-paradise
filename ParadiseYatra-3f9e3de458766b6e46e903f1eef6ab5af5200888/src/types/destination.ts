export interface Destination {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  location: string;
  holidayType?: {
    _id: string;
    title: string;
    slug: string;
    image: string;
  };
  country: string;
  state?: string;
  tourType: 'international' | 'india';
  category: string;
  rating?: number;
  price?: number;
  duration?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: ItineraryDay[];
  isActive: boolean;
  isTrending: boolean;
  visitCount: number;
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

export interface DestinationResponse {
  destinations: Destination[];
  pagination?: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  success?: boolean;
}

export interface SingleDestinationResponse {
  destination: Destination;
  message?: string;
  success?: boolean;
}
