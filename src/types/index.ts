export type GarmentCategory = 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories';

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  color: string;
  imageUrl: string;
  hasBgRemoved: boolean;
  isCustom?: boolean;
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
