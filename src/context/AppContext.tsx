import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Garment, Outfit, PlanType, ActiveTab, UserProfile, StoreItem } from '../types';

interface AppContextProps {
  user: UserProfile;
  closet: Garment[];
  currentWeather: { temp: number; condition: string; id: string };
  currentAgenda: string;
  setCurrentAgenda: (agenda: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setPlan: (plan: PlanType) => void;
  addGarment: (garment: Omit<Garment, 'id'>) => Promise<boolean>;
  deleteGarment: (id: string) => void;
  simulateBgRemoval: (imageUrl: string) => Promise<string>;
  recommendedOutfit: Outfit | null;
  allOutfits: Outfit[];
  feedbackOutfit: (outfitId: string, rating: 'like' | 'dislike') => void;
  storeItems: StoreItem[];
  isOnboarded: boolean;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Initial Mock Wardrobe Seed
const INITIAL_CLOSET: Garment[] = [
  { id: '1', name: 'Blazer Sastre Negro', category: 'outerwear', color: '#111827', imageUrl: 'blazer', hasBgRemoved: true },
  { id: '2', name: 'Blusa de Seda Crema', category: 'tops', color: '#FFFDF0', imageUrl: 'blouse', hasBgRemoved: true },
  { id: '3', name: 'Jeans Tiro Alto Azul', category: 'bottoms', color: '#1D4ED8', imageUrl: 'jeans', hasBgRemoved: true },
  { id: '4', name: 'Saco de Lana Camel', category: 'outerwear', color: '#D97706', imageUrl: 'coat', hasBgRemoved: true },
  { id: '5', name: 'Polo Algodón Blanco', category: 'tops', color: '#FFFFFF', imageUrl: 'tshirt', hasBgRemoved: true },
  { id: '6', name: 'Pantalón Sastre Plomo', category: 'bottoms', color: '#4B5563', imageUrl: 'pants', hasBgRemoved: true },
  { id: '7', name: 'Zapatillas Cuero Blanco', category: 'shoes', color: '#F9FAFB', imageUrl: 'sneakers', hasBgRemoved: true },
  { id: '8', name: 'Mocasines Cuero Negro', category: 'shoes', color: '#1F2937', imageUrl: 'loafers', hasBgRemoved: true },
  { id: '9', name: 'Cartera Tote de Cuero', category: 'accessories', color: '#78350F', imageUrl: 'bag', hasBgRemoved: true },
  { id: '10', name: 'Reloj Analógico Plata', category: 'accessories', color: '#9CA3AF', imageUrl: 'watch', hasBgRemoved: true },
  { id: '11', name: 'Lentes de Sol Carey', category: 'accessories', color: '#4B2C0A', imageUrl: 'sunglasses', hasBgRemoved: true },
  { id: '12', name: 'Botas de Gamuza Marrón', category: 'shoes', color: '#5B3E31', imageUrl: 'boots', hasBgRemoved: true }
];

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
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const saved = localStorage.getItem('sf_onboarded');
    return saved === 'true';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sf_user');
    return saved ? JSON.parse(saved) : {
      name: 'Valeria Torres',
      email: 'valeria.torres@sistemas.unmsm.edu.pe',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Valeria',
      plan: 'free'
    };
  });

  const [closet, setCloset] = useState<Garment[]>(() => {
    const saved = localStorage.getItem('sf_closet');
    return saved ? JSON.parse(saved) : INITIAL_CLOSET;
  });

  const [currentWeather, setCurrentWeather] = useState({
    temp: 17,
    condition: 'Nublado y Llovizna leve (Típico de Lima)',
    id: 'cloudy'
  });

  const [currentAgenda, setCurrentAgenda] = useState<string>('work');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [recommendedOutfit, setRecommendedOutfit] = useState<Outfit | null>(null);

  // Synchronize storage
  useEffect(() => {
    localStorage.setItem('sf_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sf_closet', JSON.stringify(closet));
  }, [closet]);

  const setPlan = (plan: PlanType) => {
    setUser(prev => ({ ...prev, plan }));
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('sf_onboarded', 'true');
    setActiveTab('dashboard');
  };

  const simulateBgRemoval = async (imageUrl: string): Promise<string> => {
    // Simulates the < 5s background removal (taking 2s here for a great visual spinner)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(imageUrl + '_bg_removed');
      }, 2000);
    });
  };

  const addGarment = async (garment: Omit<Garment, 'id'>): Promise<boolean> => {
    // Plan Limits
    if (user.plan === 'free' && closet.length >= 20) {
      return false; // Limit exceeded
    }

    const newGarment: Garment = {
      ...garment,
      id: Math.random().toString(36).substring(2, 9),
      isCustom: true
    };

    setCloset(prev => [newGarment, ...prev]);
    return true;
  };

  const deleteGarment = (id: string) => {
    setCloset(prev => prev.filter(item => item.id !== id));
  };

  // Weather simulation change
  useEffect(() => {
    if (currentAgenda === 'casual') {
      setCurrentWeather({ temp: 22, condition: 'Despejado templado', id: 'sunny' });
    } else if (currentAgenda === 'college') {
      setCurrentWeather({ temp: 18, condition: 'Nublado y Ventoso', id: 'windy' });
    } else if (currentAgenda === 'work') {
      setCurrentWeather({ temp: 16, condition: 'Neblina Limeña', id: 'cloudy' });
    } else {
      setCurrentWeather({ temp: 14, condition: 'Llovizna persistente', id: 'cold' });
    }
  }, [currentAgenda]);

  // Generación Inteligente de Combinaciones Mock (Mix & Match Logic)
  const allOutfits: Outfit[] = [
    {
      id: 'o1',
      name: 'Smart Casual de Invierno',
      tops: closet.find(c => c.id === '2') || closet[1], // Blusa Crema
      bottoms: closet.find(c => c.id === '6') || closet[5], // Pantalón Plomo
      outerwear: closet.find(c => c.id === '1') || closet[0], // Blazer Negro
      shoes: closet.find(c => c.id === '8') || closet[7], // Mocasines
      accessories: [closet.find(c => c.id === '9') || closet[8], closet.find(c => c.id === '10') || closet[9]] as Garment[],
      suitabilityWeather: ['cloudy', 'windy', 'cold'],
      suitabilityAgenda: ['work', 'college'],
      description: 'Un look formal pero cómodo para reuniones de oficina o clases importantes en UNMSM.'
    },
    {
      id: 'o2',
      name: 'Estilo Urbano de Fin de Semana',
      tops: closet.find(c => c.id === '5') || closet[4], // Polo Blanco
      bottoms: closet.find(c => c.id === '3') || closet[2], // Jeans Azul
      outerwear: closet.find(c => c.id === '4') || closet[3], // Saco Camel
      shoes: closet.find(c => c.id === '7') || closet[6], // Zapatillas Blancas
      accessories: [closet.find(c => c.id === '11') || closet[10]] as Garment[],
      suitabilityWeather: ['sunny', 'windy', 'cloudy'],
      suitabilityAgenda: ['casual', 'college'],
      description: 'Combinación perfecta y abrigadora para salir por Miraflores o Barranco con amigos.'
    },
    {
      id: 'o3',
      name: 'OOTD Ejecutivo Contemporáneo',
      tops: closet.find(c => c.id === '2') || closet[1], // Blusa Crema
      bottoms: closet.find(c => c.id === '6') || closet[5], // Pantalón Plomo
      outerwear: closet.find(c => c.id === '4') || closet[3], // Saco Camel
      shoes: closet.find(c => c.id === '12') || closet[11], // Botas Marrón
      accessories: [closet.find(c => c.id === '9') || closet[8]] as Garment[],
      suitabilityWeather: ['cold', 'cloudy'],
      suitabilityAgenda: ['work', 'date'],
      description: 'Alinea elegancia y calidez frente a la neblina invernal limeña.'
    },
    {
      id: 'o4',
      name: 'Noche Chic Informal',
      tops: closet.find(c => c.id === '5') || closet[4], // Polo Blanco
      bottoms: closet.find(c => c.id === '3') || closet[2], // Jeans Azul
      outerwear: closet.find(c => c.id === '1') || closet[0], // Blazer Negro
      shoes: closet.find(c => c.id === '8') || closet[7], // Mocasines Negro
      accessories: [closet.find(c => c.id === '11') || closet[10], closet.find(c => c.id === '10') || closet[9]] as Garment[],
      suitabilityWeather: ['sunny', 'windy', 'cloudy', 'cold'],
      suitabilityAgenda: ['date', 'casual'],
      description: 'Ideal para una cena de noche o una reunión semi-formal.'
    }
  ];

  // Dynamic selector of daily outfits
  useEffect(() => {
    // Find outfit matching current agenda and weather
    const match = allOutfits.find(o =>
      o.suitabilityAgenda.includes(currentAgenda) &&
      o.suitabilityWeather.includes(currentWeather.id)
    ) || allOutfits[0];

    setRecommendedOutfit(match);
  }, [currentAgenda, currentWeather]);

  const feedbackOutfit = (outfitId: string, rating: 'like' | 'dislike') => {
    // Simulates training the neural network
    console.log(`AI Feedbacks: User rated outfit ${outfitId} as ${rating}`);
  };

  return (
    <AppContext.Provider value={{
      user,
      closet,
      currentWeather,
      currentAgenda,
      setCurrentAgenda,
      activeTab,
      setActiveTab,
      setPlan,
      addGarment,
      deleteGarment,
      simulateBgRemoval,
      recommendedOutfit,
      allOutfits,
      feedbackOutfit,
      storeItems: STORE_ITEMS,
      isOnboarded,
      completeOnboarding
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
