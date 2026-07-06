export type GarmentCategory = 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories';

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  color: string;
  imageUrl: string;
  hasBgRemoved: boolean;
  isCustom?: boolean;
  
  // Backend additional fields
  userId?: string;
  imageKey?: string;
  subcategory?: string | null;
  primaryColor?: string | null;
  secondaryColors?: string[];
  style?: string | null;
  season?: string[];
  material?: string | null;
  aiConfidence?: number | null;
  timesWorn?: number;
  lastWornAt?: string | null;
  createdAt?: string;
}

export interface StyleProfile {
  userId: string;
  sizes: {
    top?: string;
    bottom?: string;
    shoes?: string;
    [key: string]: string | undefined;
  } | null;
  occasions: string[] | null;
  goals: string | null;
  favoriteColors: string[] | null;
  updatedAt?: string;
}

export interface BackendOutfit {
  id: string;
  userId: string;
  garmentIds: string[];
  occasion: string | null;
  weatherContext: {
    temperatureC: number;
    precipitationProbability: number;
    weatherCode: number;
    isRaining: boolean;
  } | null;
  status: 'suggested' | 'saved' | 'worn' | 'discarded';
  createdAt: string;
}

export interface Outfit {
  id: string;
  name: string;
  tops: Garment;
  bottoms: Garment;
  outerwear?: Garment;
  shoes: Garment;
  accessories?: Garment[];
  suitabilityWeather: string[]; // 'sunny', 'cloudy', 'windy', 'cold'
  suitabilityAgenda: string[];  // 'work', 'college', 'date', 'casual'
  description?: string;
  
  // Backend metadata
  backendOutfit?: BackendOutfit;
}

export type PlanType = 'free' | 'pro' | 'elite';

export type ActiveTab = 'dashboard' | 'closet' | 'mixmatch' | 'mirror' | 'store' | 'plans';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  plan: PlanType;
}

export interface StoreItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: GarmentCategory;
  imageUrl: string;
  ecoFeature: string; // e.g. "Algodón Orgánico", "Plástico Reciclado"
  link: string;
}

export interface WeatherData {
  temperatureC: number;
  precipitationProbability: number;
  weatherCode: number;
  isRaining: boolean;
}

