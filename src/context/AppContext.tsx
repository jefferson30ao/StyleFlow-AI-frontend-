import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Garment, Outfit, PlanType, ActiveTab, UserProfile, StoreItem, StyleProfile, BackendOutfit } from '../types';
import { api, setAuthToken, getAuthToken, registerSessionExpiredCallback, mapWeatherCode } from '../services/api';

interface AppContextProps {
  // Session / Auth States
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authError: string;
  setAuthError: (err: string) => void;

  // Closet / Wardrobe
  closet: Garment[];
  fetchCloset: () => Promise<void>;
  addGarment: (garment: Omit<Garment, 'id'>) => Promise<boolean>;
  deleteGarment: (id: string) => Promise<void>;
  
  // Custom upload
  uploadGarmentFile: (file: File) => Promise<{
    imageKey: string;
    classification: any;
    classificationError: string | null;
    backgroundRemoved: boolean;
  }>;
  confirmGarment: (data: {
    imageKey: string;
    category: string;
    subcategory?: string;
    primaryColor?: string;
    secondaryColors?: string[];
    style?: string;
    season?: string[];
    material?: string;
    aiConfidence?: number;
  }) => Promise<boolean>;

  // Style Profile
  styleProfile: StyleProfile | null;
  fetchProfile: () => Promise<void>;
  updateStyleProfile: (data: Partial<Omit<StyleProfile, 'userId'>>) => Promise<void>;

  // Location / Geolocation
  coords: { lat: number; lon: number } | null;
  gpsAllowed: boolean;
  requestGps: () => Promise<boolean>;

  // Weather & Recommendations
  currentWeather: { temp: number; condition: string; id: string };
  currentAgenda: string;
  setCurrentAgenda: (agenda: string) => void;
  recommendedOutfit: Outfit | null;
  allOutfits: Outfit[];
  generateRecommendations: (baseGarmentId?: string) => Promise<void>;
  isGeneratingRecs: boolean;
  recsError: string;

  // Outfit actions
  saveOutfit: (outfitId: string) => Promise<void>;
  wearOutfit: (outfitId: string, date?: string) => Promise<void>;
  discardOutfit: (outfitId: string) => Promise<void>;

  // Outfit History
  outfitsHistory: BackendOutfit[];
  fetchOutfitsHistory: (status?: 'suggested' | 'saved' | 'worn' | 'discarded') => Promise<void>;

  // Navigation & Plan (Mocks preserved for payment)
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setPlan: (plan: PlanType) => void;
  storeItems: StoreItem[];
  isOnboarded: boolean;
  completeOnboarding: () => void;
  simulateBgRemoval: (imageUrl: string) => Promise<string>;
  feedbackOutfit: (outfitId: string, rating: 'like' | 'dislike') => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Sustainable local brands mock store items
const STORE_ITEMS: StoreItem[] = [
  {
    id: 's1',
    name: 'Top de Lino Orgánico Celeste',
    brand: 'Estrafalaria (Lima)',
    price: 89.00,
    category: 'tops',
    imageUrl: 'store_top_lino',
    ecoFeature: 'Lino 100% Orgánico',
    link: 'https://estrafalaria.com.pe'
  },
  {
    id: 's2',
    name: 'Pantalón Culotte Algodón Reciclado',
    brand: 'Sanna Eco (San Isidro)',
    price: 149.00,
    category: 'bottoms',
    imageUrl: 'store_culotte',
    ecoFeature: 'Algodón recuperado',
    link: 'https://sannaecostore.pe'
  },
  {
    id: 's3',
    name: 'Casaca Cortaviento Eco-Nylon',
    brand: 'Insecta Vegan Leather (Lima)',
    price: 210.00,
    category: 'outerwear',
    imageUrl: 'store_casaca',
    ecoFeature: 'Nylon de botellas PET',
    link: 'https://insecta.pe'
  },
  {
    id: 's4',
    name: 'Tote Bag de Canvas Reciclado',
    brand: 'Höség (Miraflores)',
    price: 65.00,
    category: 'accessories',
    imageUrl: 'store_tote',
    ecoFeature: '1 Compra = 1 Abrigo donado',
    link: 'https://hoseg.pe'
  }
];



export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Plan states
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('sf_onboarded') === 'true';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string>('');

  // Closet / Profile / History States
  const [closet, setCloset] = useState<Garment[]>([]);
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [outfitsHistory, setOutfitsHistory] = useState<BackendOutfit[]>([]);

  // Geolocation States
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsAllowed, setGpsAllowed] = useState<boolean>(false);

  // Recommendations / Weather States
  const [currentWeather, setCurrentWeather] = useState({
    temp: 17,
    condition: 'Neblina limeña (GPS desactivado)',
    id: 'cloudy'
  });
  const [currentAgenda, setCurrentAgenda] = useState<string>('work');
  const [recommendedOutfit, setRecommendedOutfit] = useState<Outfit | null>(null);
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState<boolean>(false);
  const [recsError, setRecsError] = useState<string>('');

  // Resolve BackendOutfit to frontend Outfit
  const resolveOutfit = useCallback((backendOutfit: BackendOutfit, closetList: Garment[]): Outfit => {
    const list = closetList.length > 0 ? closetList : closet;
    
    // Helper to find by category
    const findGarment = (cat: string) => {
      const gId = backendOutfit.garmentIds.find(id => {
        const item = list.find(c => c.id === id);
        return item && item.category === cat;
      });
      return list.find(c => c.id === gId);
    };

    const topsItem = findGarment('tops') || list.find(c => c.category === 'tops') || list[0];
    const bottomsItem = findGarment('bottoms') || list.find(c => c.category === 'bottoms') || list[0];
    const shoesItem = findGarment('shoes') || list.find(c => c.category === 'shoes') || list[0];
    const outerwearItem = findGarment('outerwear') || list.find(c => c.category === 'outerwear');
    
    const accessoriesList = list.filter(c => 
      c.category === 'accessories' && backendOutfit.garmentIds.includes(c.id)
    );

    const wCode = backendOutfit.weatherContext?.weatherCode ?? 1;
    const wMapped = mapWeatherCode(wCode);

    return {
      id: backendOutfit.id,
      name: backendOutfit.occasion 
        ? `Estilo ${backendOutfit.occasion.charAt(0).toUpperCase() + backendOutfit.occasion.slice(1)}`
        : 'Sugerencia de Diario',
      tops: topsItem,
      bottoms: bottomsItem,
      shoes: shoesItem,
      outerwear: outerwearItem,
      accessories: accessoriesList.length > 0 ? accessoriesList : undefined,
      suitabilityWeather: [wMapped.id],
      suitabilityAgenda: [backendOutfit.occasion || 'casual'],
      description: `Recomendación inteligente para tu agenda de ${backendOutfit.occasion || 'diario'} con clima templado de ${backendOutfit.weatherContext?.temperatureC ?? 18}°C.`,
      backendOutfit
    };
  }, [closet]);

  // Load Initial Data
  const loadData = useCallback(async () => {
    try {
      const garmentsList = await api.garments.list();
      setCloset(garmentsList);

      const profile = await api.profile.getProfile();
      setStyleProfile(profile);

      // Fetch history
      const history = await api.outfits.listOutfits();
      setOutfitsHistory(history);
    } catch (err) {
      console.error('Error al cargar datos del backend:', err);
    }
  }, []);

  // Validate session on startup
  useEffect(() => {
    const validateSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticating(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        // Set basic user profile
        setUser({
          name: res.user.email.split('@')[0],
          email: res.user.email,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${res.user.id}`,
          plan: (localStorage.getItem('sf_plan') as PlanType) || 'free'
        });
        setIsAuthenticated(true);
        await loadData();
      } catch (err) {
        console.error('Sesión inválida al arrancar:', err);
        setAuthToken('');
      } finally {
        setIsAuthenticating(false);
      }
    };

    validateSession();

    // Register callback for when session expires (401 response)
    registerSessionExpiredCallback(() => {
      setIsAuthenticated(false);
      setUser(null);
      setCloset([]);
      setStyleProfile(null);
      setOutfitsHistory([]);
      setActiveTab('dashboard');
    });
  }, [loadData]);

  // Fetch functions
  const fetchCloset = async () => {
    try {
      const list = await api.garments.list();
      setCloset(list);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const prof = await api.profile.getProfile();
      setStyleProfile(prof);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchOutfitsHistory = async (status?: 'suggested' | 'saved' | 'worn' | 'discarded') => {
    try {
      const list = await api.outfits.listOutfits(status);
      setOutfitsHistory(list);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Auth Operations
  const login = async (email: string, password: string) => {
    setAuthError('');
    try {
      const res = await api.auth.signin(email, password);
      const userProfile: UserProfile = {
        name: res.user.email.split('@')[0],
        email: res.user.email,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${res.user.id}`,
        plan: (localStorage.getItem('sf_plan') as PlanType) || 'free'
      };
      setUser(userProfile);
      setIsAuthenticated(true);
      await loadData();
    } catch (err: any) {
      setAuthError(err.message || 'Error al iniciar sesión.');
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    setAuthError('');
    try {
      const res = await api.auth.signup(email, password);
      const userProfile: UserProfile = {
        name: res.user.email.split('@')[0],
        email: res.user.email,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${res.user.id}`,
        plan: 'free'
      };
      setUser(userProfile);
      setIsAuthenticated(true);
      await loadData();
    } catch (err: any) {
      setAuthError(err.message || 'Error al registrar usuario.');
      throw err;
    }
  };

  const logout = () => {
    setAuthToken('');
    setIsAuthenticated(false);
    setUser(null);
    setCloset([]);
    setStyleProfile(null);
    setOutfitsHistory([]);
    setIsOnboarded(false);
    localStorage.removeItem('sf_onboarded');
    setActiveTab('dashboard');
  };

  // Style Profile Operations
  const updateStyleProfile = async (data: Partial<Omit<StyleProfile, 'userId'>>) => {
    try {
      const updated = await api.profile.updateProfile(data);
      setStyleProfile(updated);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // Request GPS Permissions
  const requestGps = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setGpsAllowed(false);
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setGpsAllowed(true);
          resolve(true);
        },
        (error) => {
          console.warn('GPS permiso denegado:', error);
          setGpsAllowed(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  // Generate Recommendations with live coordinates
  const generateRecommendations = async (baseGarmentId?: string) => {
    if (!gpsAllowed || !coords) {
      const allowed = await requestGps();
      if (!allowed) {
        setRecsError('Se requiere geolocalización para generar recomendaciones basadas en el clima real de Lima.');
        return;
      }
    }

    if (!coords) return;

    setIsGeneratingRecs(true);
    setRecsError('');
    try {
      const rawOutfits = await api.recommendations.getRecommendations({
        occasion: currentAgenda,
        lat: coords.lat,
        lon: coords.lon,
        baseGarmentId
      });

      if (rawOutfits.length > 0) {
        const resolvedList = rawOutfits.map((o: BackendOutfit) => resolveOutfit(o, closet));
        setAllOutfits(resolvedList);
        setRecommendedOutfit(resolvedList[0]);
        
        // Update weather from context returned
        const wCtx = rawOutfits[0].weatherContext;
        if (wCtx) {
          const wMapped = mapWeatherCode(wCtx.weatherCode);
          setCurrentWeather({
            temp: Math.round(wCtx.temperatureC),
            condition: wMapped.condition,
            id: wMapped.id
          });
        }
      } else {
        setAllOutfits([]);
        setRecommendedOutfit(null);
      }
    } catch (err: any) {
      setRecsError(err.message || 'Error al obtener recomendaciones.');
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  // Fetch recommendations automatically when coords or agenda changes
  useEffect(() => {
    if (isAuthenticated && coords) {
      generateRecommendations();
    }
  }, [currentAgenda, coords, isAuthenticated]);

  // Outfit actions
  const saveOutfit = async (outfitId: string) => {
    try {
      const updated = await api.outfits.saveOutfit(outfitId);
      // Update recommended outfit status
      if (recommendedOutfit && recommendedOutfit.id === outfitId) {
        setRecommendedOutfit(prev => prev ? {
          ...prev,
          backendOutfit: updated
        } : null);
      }
      await fetchOutfitsHistory();
    } catch (err: any) {
      console.error(err);
    }
  };

  const wearOutfit = async (outfitId: string, date?: string) => {
    try {
      const updated = await api.outfits.wearOutfit(outfitId, date);
      if (recommendedOutfit && recommendedOutfit.id === outfitId) {
        setRecommendedOutfit(prev => prev ? {
          ...prev,
          backendOutfit: updated
        } : null);
      }
      await fetchOutfitsHistory();
      await fetchCloset(); // Refresh garments timesWorn and lastWornAt
    } catch (err: any) {
      console.error(err);
    }
  };

  const discardOutfit = async (outfitId: string) => {
    try {
      const updated = await api.outfits.discardOutfit(outfitId);
      if (recommendedOutfit && recommendedOutfit.id === outfitId) {
        setRecommendedOutfit(prev => prev ? {
          ...prev,
          backendOutfit: updated
        } : null);
      }
      await fetchOutfitsHistory();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Real Image Upload
  const uploadGarmentFile = async (file: File) => {
    try {
      const res = await api.garments.upload(file);
      return {
        imageKey: res.imageKey,
        classification: res.classification,
        classificationError: res.classificationError,
        backgroundRemoved: res.backgroundRemoved
      };
    } catch (err: any) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

  const confirmGarment = async (data: any): Promise<boolean> => {
    // Pro limit check
    if (user?.plan === 'free' && closet.length >= 20) {
      return false;
    }
    try {
      const created = await api.garments.create(data);
      setCloset(prev => [created, ...prev]);
      return true;
    } catch (err: any) {
      console.error('Error confirming garment:', err);
      throw err;
    }
  };

  // Mock addGarment (falls back to creating a dummy item in backend or local)
  const addGarment = async (garment: Omit<Garment, 'id'>): Promise<boolean> => {
    if (user?.plan === 'free' && closet.length >= 20) {
      return false;
    }
    try {
      // Create mockup imageKey and upload
      const dummyItem = {
        imageKey: `mock_${Math.random().toString(36).substring(2, 9)}.png`,
        category: garment.category,
        primaryColor: garment.color,
        subcategory: garment.name
      };
      const created = await api.garments.create(dummyItem);
      setCloset(prev => [created, ...prev]);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  const deleteGarment = async (id: string) => {
    try {
      await api.garments.delete(id);
      setCloset(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error(err);
    }
  };

  // Mock updates for premium plan simulations
  const setPlan = (plan: PlanType) => {
    if (user) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      localStorage.setItem('sf_plan', plan);
    }
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('sf_onboarded', 'true');
    setActiveTab('dashboard');
  };

  const simulateBgRemoval = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(imageUrl + '_bg_removed');
      }, 2000);
    });
  };

  const feedbackOutfit = (outfitId: string, rating: 'like' | 'dislike') => {
    console.log(`AI Feedbacks: User rated outfit ${outfitId} as ${rating}`);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      isAuthenticating,
      user,
      login,
      register,
      logout,
      authError,
      setAuthError,
      closet,
      fetchCloset,
      addGarment,
      deleteGarment,
      uploadGarmentFile,
      confirmGarment,
      styleProfile,
      fetchProfile,
      updateStyleProfile,
      coords,
      gpsAllowed,
      requestGps,
      currentWeather,
      currentAgenda,
      setCurrentAgenda,
      recommendedOutfit,
      allOutfits,
      generateRecommendations,
      isGeneratingRecs,
      recsError,
      saveOutfit,
      wearOutfit,
      discardOutfit,
      outfitsHistory,
      fetchOutfitsHistory,
      activeTab,
      setActiveTab,
      setPlan,
      storeItems: STORE_ITEMS,
      isOnboarded,
      completeOnboarding,
      simulateBgRemoval,
      feedbackOutfit
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
