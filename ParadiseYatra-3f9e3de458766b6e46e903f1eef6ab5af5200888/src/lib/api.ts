import { Package } from '@/types/package';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || 'API request failed', response.status);
  }

  // Handle direct array responses (like packages by category)
  if (Array.isArray(data)) {
    return data;
  }

  return data;
};

const makeRequest = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
};

export const packagesAPI = {
  async getAll(params: Record<string, unknown> = {}): Promise<ApiResponse<Package[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const url = `/api/packages${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return makeRequest(url);
  },

  async getById(id: string): Promise<ApiResponse<Package>> {
    const url = `/api/packages/${id}`;
    return makeRequest(url);
  },

  async getTrending(): Promise<ApiResponse<Package[]>> {
    const url = `/api/packages?featured=true&limit=6`;
    return makeRequest(url);
  },

  async getByCategory(category: string, params: Record<string, unknown> = {}): Promise<ApiResponse<Package[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const url = `/api/packages/category/${encodeURIComponent(category)}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return makeRequest(url);
  },

  async search(query: string, params: Record<string, unknown> = {}): Promise<ApiResponse<Package[]>> {
    const searchParams = new URLSearchParams({ q: query, ...params });
    const url = `/api/packages/search?${searchParams.toString()}`;
    return makeRequest(url);
  },

  async create(packageData: Partial<Package>): Promise<ApiResponse<Package>> {
    const url = `/api/packages`;
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  },

  async update(id: string, packageData: Partial<Package>): Promise<ApiResponse<Package>> {
    const url = `/api/packages/${id}`;
    return makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const url = `/api/packages/${id}`;
    return makeRequest(url, {
      method: 'DELETE',
    });
  },

  // New filtering methods
  async getByTourType(tourType: string, params: Record<string, unknown> = {}): Promise<ApiResponse<Package[]>> {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const url = `/api/packages/tour-type/${tourType}?${searchParams.toString()}`;
    return makeRequest(url);
  },

  async getByCountry(country: string, params: Record<string, unknown> = {}): Promise<ApiResponse<Package[]>> {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const url = `/api/packages/country/${country}?${searchParams.toString()}`;
    return makeRequest(url);
  },

  async getByState(state: string, params: Record<string, unknown> = {}): Promise<ApiResponse<Package[]>> {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    // Normalize state parameter for URL path
    const normalizedState = state
      .replace(/&/g, 'and') // Replace & with 'and'
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim(); // Remove leading/trailing spaces
    const url = `/api/packages/state/${encodeURIComponent(normalizedState)}?${searchParams.toString()}`;
    return makeRequest(url);
  },

  async getByHolidayType(holidayTypeId: string, params: Record<string, unknown> = {}): Promise<ApiResponse<Package[]>> {
    const searchParams = new URLSearchParams(params as Record<string, string>);
    const url = `/api/packages/holiday-type/${holidayTypeId}?${searchParams.toString()}`;
    return makeRequest(url);
  },

  async getAvailableCountries(): Promise<ApiResponse<string[]>> {
    const url = `/api/packages/countries`;
    return makeRequest(url);
  },

  async getAvailableTourTypes(): Promise<ApiResponse<string[]>> {
    const url = `/api/packages/tour-types`;
    return makeRequest(url);
  },

  async getAvailableStates(): Promise<ApiResponse<string[]>> {
    const url = `/api/packages/states`;
    return makeRequest(url);
  },
};

// Header content interface
export interface HeaderContent {
  _id?: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  trustIndicators: Array<{
    icon: string;
    text: string;
    color: string;
  }>;
  navigation: Array<{
    name: string;
    submenu: Array<{
      name: string;
      href: string;
    }>;
  }>;
  logo: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const headerAPI = {
  async get(): Promise<ApiResponse<HeaderContent>> {
    const url = `/api/header`;
    return makeRequest(url);
  },

  async getAll(): Promise<ApiResponse<HeaderContent[]>> {
    const url = `/api/header/admin/all`;
    return makeRequest(url);
  },

  async create(headerData: Partial<HeaderContent>): Promise<ApiResponse<HeaderContent>> {
    const url = `/api/header`;
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(headerData),
    });
  },

  async update(id: string, headerData: Partial<HeaderContent>): Promise<ApiResponse<HeaderContent>> {
    const url = `/api/header/${id}`;
    return makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(headerData),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const url = `/api/header/${id}`;
    return makeRequest(url, {
      method: 'DELETE',
    });
  },
}; 