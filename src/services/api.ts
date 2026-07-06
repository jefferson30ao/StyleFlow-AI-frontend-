import type { Garment, StyleProfile, BackendOutfit, WeatherData } from '../types';

const BASE_URL = import.meta.env.DEV ? '/api/v1' : 'https://styleflow-api.s4vi0r.tech/api/v1';

// Category mappings between frontend and backend
export const mapCategoryToBackend = (category: string): string => {
  if (category === 'tops') return 'top';
  if (category === 'bottoms') return 'bottom';
  if (category === 'accessories') return 'accessory';
  return category; // outerwear, shoes
};

export const mapCategoryToFrontend = (category: string): any => {
  if (category === 'top') return 'tops';
  if (category === 'bottom') return 'bottoms';
  if (category === 'accessory') return 'accessories';
  return category;
};

// Auth Token management helper
let authToken = localStorage.getItem('sf_auth_token') || '';

export const setAuthToken = (token: string) => {
  authToken = token;
  if (token) {
    localStorage.setItem('sf_auth_token', token);
  } else {
    localStorage.removeItem('sf_auth_token');
  }
};

export const getAuthToken = () => authToken;

// Global 401 callback to let AppContext know when the session expired
let onSessionExpiredCallback: (() => void) | null = null;

export const registerSessionExpiredCallback = (callback: () => void) => {
  onSessionExpiredCallback = callback;
};

// Generic request wrapper
async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  isMultipart = false
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  if (!isMultipart && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = isMultipart || body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return {} as T;
    }

    let responseData: any;
    const text = await response.text();
    if (text) {
      try {
        responseData = JSON.parse(text);
      } catch (err) {
        responseData = { errors: ['Respuesta no válida del servidor.'] };
      }
    } else {
      responseData = {};
    }

    if (!response.ok) {
      if (response.status === 401) {
        setAuthToken('');
        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }
        throw new Error(responseData.errors?.[0] || 'Sesión expirada o no autorizada.');
      }
      
      const errorMsg = responseData.errors && Array.isArray(responseData.errors)
        ? responseData.errors.join(', ')
        : 'Error desconocido del servidor.';
      throw new Error(errorMsg);
    }

    return responseData as T;
  } catch (error: any) {
    console.error(`API Error on ${method} ${endpoint}:`, error);
    throw error;
  }
}

// Map a backend Garment to the frontend model
export const resolveBackendGarment = (bg: any): Garment => {
  return {
    id: bg.id,
    name: bg.subcategory
      ? `${bg.subcategory.charAt(0).toUpperCase() + bg.subcategory.slice(1)} ${bg.primaryColor || ''}`.trim()
      : `${mapCategoryToFrontend(bg.category).slice(0, -1).toUpperCase()} ${bg.primaryColor || ''}`.trim(),
    category: mapCategoryToFrontend(bg.category),
    color: bg.primaryColor || '#a78bfa',
    imageUrl: bg.imageUrl,
    hasBgRemoved: true,
    isCustom: true,
    
    // Add raw fields
    userId: bg.userId,
    imageKey: bg.imageKey,
    subcategory: bg.subcategory,
    primaryColor: bg.primaryColor,
    secondaryColors: bg.secondaryColors || [],
    style: bg.style,
    season: bg.season || [],
    material: bg.material,
    aiConfidence: bg.aiConfidence,
    timesWorn: bg.timesWorn || 0,
    lastWornAt: bg.lastWornAt,
    createdAt: bg.createdAt
  };
};

export const api = {
  auth: {
    signup: async (email: string, password: string) => {
      const res = await request<{ token: string; user: { id: string; email: string } }>(
        '/auth/signup',
        'POST',
        { email, password }
      );
      setAuthToken(res.token);
      return res;
    },
    signin: async (email: string, password: string) => {
      const res = await request<{ token: string; user: { id: string; email: string } }>(
        '/auth/signin',
        'POST',
        { email, password }
      );
      setAuthToken(res.token);
      return res;
    },
    getMe: async () => {
      return request<{ user: { id: string; email: string; createdAt: string } }>('/auth/me', 'GET');
    }
  },

  profile: {
    getProfile: async () => {
      const res = await request<{ profile: StyleProfile }>('/profile', 'GET');
      return res.profile;
    },
    updateProfile: async (data: Partial<Omit<StyleProfile, 'userId'>>) => {
      const res = await request<{ profile: StyleProfile }>('/profile', 'PUT', data);
      return res.profile;
    }
  },

  garments: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      return request<{
        imageKey: string;
        classification: {
          category: string;
          subcategory: string | null;
          primaryColor: string | null;
          secondaryColors: string[];
          style: string | null;
          season: string[];
          material: string | null;
          confidence: number;
        } | null;
        classificationError: string | null;
        backgroundRemoved: boolean;
        backgroundRemovalError: string | null;
      }>('/garments/upload', 'POST', formData, true);
    },
    create: async (data: {
      imageKey: string;
      category: string;
      subcategory?: string;
      primaryColor?: string;
      secondaryColors?: string[];
      style?: string;
      season?: string[];
      material?: string;
      aiConfidence?: number;
    }) => {
      const mappedData = {
        ...data,
        category: mapCategoryToBackend(data.category)
      };
      const res = await request<{ garment: any }>('/garments', 'POST', mappedData);
      return resolveBackendGarment(res.garment);
    },
    list: async (filters?: { category?: string; season?: string }) => {
      let query = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'all') {
          params.append('category', mapCategoryToBackend(filters.category));
        }
        if (filters.season) {
          params.append('season', filters.season);
        }
        const qs = params.toString();
        if (qs) query = `?${qs}`;
      }
      const res = await request<{ garments: any[] }>(`/garments${query}`, 'GET');
      return res.garments.map(resolveBackendGarment);
    },
    get: async (id: string) => {
      const res = await request<{ garment: any }>(`/garments/${id}`, 'GET');
      return resolveBackendGarment(res.garment);
    },
    update: async (
      id: string,
      data: {
        category?: string;
        subcategory?: string;
        primaryColor?: string;
        secondaryColors?: string[];
        style?: string;
        season?: string[];
        material?: string;
        aiConfidence?: number;
      }
    ) => {
      const mappedData: any = { ...data };
      if (data.category) {
        mappedData.category = mapCategoryToBackend(data.category);
      }
      const res = await request<{ garment: any }>(`/garments/${id}`, 'PATCH', mappedData);
      return resolveBackendGarment(res.garment);
    },
    delete: async (id: string) => {
      return request<void>(`/garments/${id}`, 'DELETE');
    }
  },

  weather: {
    getWeather: async (lat: number, lon: number) => {
      const res = await request<{ weather: WeatherData }>(`/weather?lat=${lat}&lon=${lon}`, 'GET');
      return res.weather;
    }
  },

  recommendations: {
    getRecommendations: async (data: { occasion?: string; lat: number; lon: number; baseGarmentId?: string }) => {
      const res = await request<{ outfits: BackendOutfit[] }>('/recommendations', 'POST', data);
      return res.outfits;
    }
  },

  outfits: {
    listOutfits: async (status?: 'suggested' | 'saved' | 'worn' | 'discarded') => {
      const query = status ? `?status=${status}` : '';
      const res = await request<{ outfits: BackendOutfit[] }>(`/outfits${query}`, 'GET');
      return res.outfits;
    },
    saveOutfit: async (id: string) => {
      const res = await request<{ outfit: BackendOutfit }>(`/outfits/${id}/save`, 'POST');
      return res.outfit;
    },
    wearOutfit: async (id: string, date?: string) => {
      const res = await request<{ outfit: BackendOutfit }>(`/outfits/${id}/wear`, 'POST', date ? { date } : undefined);
      return res.outfit;
    },
    discardOutfit: async (id: string) => {
      const res = await request<{ outfit: BackendOutfit }>(`/outfits/${id}/discard`, 'POST');
      return res.outfit;
    }
  }
};

export const mapWeatherCode = (code: number): { condition: string; id: 'sunny' | 'cloudy' | 'cold' | 'windy' } => {
  if (code === 0) {
    return { condition: 'Soleado y despejado', id: 'sunny' };
  } else if (code >= 1 && code <= 3) {
    return { condition: 'Parcialmente Nublado', id: 'cloudy' };
  } else if (code === 45 || code === 48) {
    return { condition: 'Niebla / Neblina limeña', id: 'cloudy' };
  } else if ((code >= 51 && code <= 55) || (code >= 80 && code <= 82)) {
    return { condition: 'Llovizna leve', id: 'cold' };
  } else if (code >= 61 && code <= 65) {
    return { condition: 'Lluvia persistente', id: 'cold' };
  } else if (code >= 95) {
    return { condition: 'Tormenta eléctrica', id: 'windy' };
  }
  return { condition: 'Templado nublado', id: 'cloudy' };
};

